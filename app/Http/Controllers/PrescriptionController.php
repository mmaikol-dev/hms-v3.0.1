<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $prescriptions = Prescription::with(['patient', 'doctor.user', 'items.medicine'])
            ->when($search, function ($query, $search) {
                $query->where('prescription_number', 'like', "%{$search}%")
                    ->orWhere('diagnosis', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('prescription_date', 'desc')
            ->paginate(15);

        return Inertia::render('prescriptions/index', [
            'prescriptions' => $prescriptions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'phone')->get();
        $doctors = Doctor::with('user:id,name')->get();
        $medicines = Medicine::where('quantity_in_stock', '>', 0)
            ->select('id', 'name', 'quantity_in_stock', 'unit_price')
            ->get();
        $appointments = Appointment::with(['patient:id,first_name,last_name', 'doctor.user:id,name'])
            ->where('status', 'confirmed')
            ->whereDate('appointment_date', '>=', today())
            ->get();

        return Inertia::render('prescriptions/create', [
            'patients' => $patients,
            'doctors' => $doctors,
            'medicines' => $medicines,
            'appointments' => $appointments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'prescription_date' => 'required|date',
            'diagnosis' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.dosage' => 'required|string|max:100',
            'items.*.frequency' => 'required|string|max:100',
            'items.*.duration_days' => 'required|integer|min:1|max:365',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.instructions' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            // Generate prescription number
            $count = Prescription::whereDate('created_at', today())->count() + 1;
            $prescriptionNumber = 'PRX-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $prescription = Prescription::create([
                'prescription_number' => $prescriptionNumber,
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'appointment_id' => $validated['appointment_id'] ?? null,
                'prescription_date' => $validated['prescription_date'],
                'diagnosis' => $validated['diagnosis'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending'
            ]);

            // Create prescription items
            foreach ($validated['items'] as $item) {
                $prescription->items()->create($item);
            }

            DB::commit();

            return redirect()->route('prescriptions.index')
                ->with('success', 'Prescription created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create prescription: ' . $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $prescription = Prescription::with([
            'patient',
            'doctor.user',
            'appointment',
            'items.medicine'
        ])->findOrFail($id);

        return Inertia::render('prescriptions/show', [
            'prescription' => $prescription
        ]);
    }

    public function edit($id)
    {
        $prescription = Prescription::with(['items.medicine'])->findOrFail($id);
        
        $patients = Patient::select('id', 'first_name', 'last_name', 'phone')->get();
        $doctors = Doctor::with('user:id,name')->get();
        $medicines = Medicine::where('quantity_in_stock', '>', 0)
            ->select('id', 'name', 'quantity_in_stock', 'unit_price')
            ->get();

        return Inertia::render('prescriptions/edit', [
            'prescription' => $prescription,
            'patients' => $patients,
            'doctors' => $doctors,
            'medicines' => $medicines,
        ]);
    }

    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);

        if ($prescription->status === 'dispensed') {
            return back()->withErrors(['error' => 'Cannot update dispensed prescription']);
        }

        $validated = $request->validate([
            'diagnosis' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:pending,dispensed,cancelled',
            'items' => 'sometimes|array|min:1',
            'items.*.medicine_id' => 'required_with:items|exists:medicines,id',
            'items.*.dosage' => 'required_with:items|string|max:100',
            'items.*.frequency' => 'required_with:items|string|max:100',
            'items.*.duration_days' => 'required_with:items|integer|min:1|max:365',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.instructions' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $prescription->update([
                'diagnosis' => $validated['diagnosis'] ?? $prescription->diagnosis,
                'notes' => $validated['notes'] ?? $prescription->notes,
                'status' => $validated['status'] ?? $prescription->status,
            ]);

            // Update items if provided
            if (isset($validated['items'])) {
                $prescription->items()->delete();
                foreach ($validated['items'] as $item) {
                    $prescription->items()->create($item);
                }
            }

            DB::commit();

            return redirect()->route('prescriptions.index')
                ->with('success', 'Prescription updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update prescription: ' . $e->getMessage()]);
        }
    }

    public function dispense($id)
    {
        $prescription = Prescription::with('items.medicine')->findOrFail($id);

        if ($prescription->status === 'dispensed') {
            return back()->withErrors(['error' => 'Prescription already dispensed']);
        }

        DB::beginTransaction();
        try {
            // Check stock availability
            foreach ($prescription->items as $item) {
                $medicine = $item->medicine;
                if ($medicine->quantity_in_stock < $item->quantity) {
                    throw new \Exception("Insufficient stock for {$medicine->name}. Required: {$item->quantity}, Available: {$medicine->quantity_in_stock}");
                }
            }

            // Deduct stock
            foreach ($prescription->items as $item) {
                $item->medicine->decrement('quantity_in_stock', $item->quantity);
            }

            $prescription->update(['status' => 'dispensed']);

            DB::commit();

            return back()->with('success', 'Prescription dispensed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $prescription = Prescription::findOrFail($id);

        if ($prescription->status === 'dispensed') {
            return back()->withErrors(['error' => 'Cannot delete dispensed prescription']);
        }

        $prescription->delete();

        return redirect()->route('prescriptions.index')
            ->with('success', 'Prescription deleted successfully');
    }
}
