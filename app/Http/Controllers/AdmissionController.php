<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdmissionController extends Controller
{
    public function index()
    {
        $admissions = Admission::with(['patient', 'doctor', 'bed.ward'])
            ->orderBy('admission_date', 'desc')
            ->paginate(15);

        return Inertia::render('admissions/index', [
            'admissions' => $admissions,
        ]);
    }

    public function create()
    {
        return Inertia::render('admissions/create', [
            'patients' => Patient::select('id', 'first_name', 'last_name')->get(),
            'doctors' => Doctor::with('user:id,name')->get(), // load user name
            'beds' => Bed::select('id', 'bed_number')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'bed_id' => 'required|exists:beds,id',
            'admission_date' => 'required|date',
            'admission_reason' => 'required|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Generate admission number
            $validated['admission_number'] = 'ADM'.date('Ymd').str_pad(Admission::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
            $validated['status'] = 'admitted';

            $admission = Admission::create($validated);

            // Update bed status
            Bed::where('id', $validated['bed_id'])->update(['status' => 'occupied']);

            DB::commit();

            return response()->json($admission->load(['patient', 'doctor', 'bed.ward']), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to create admission'], 500);
        }
    }

    public function show($id)
    {
        $admission = Admission::with(['patient', 'doctor', 'bed.ward'])->findOrFail($id);

        return response()->json($admission);
    }

    public function update(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $validated = $request->validate([
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'discharge_summary' => 'nullable|string',
        ]);

        $admission->update($validated);

        return response()->json($admission->load(['patient', 'doctor', 'bed.ward']));
    }

    public function discharge(Request $request, $id)
    {
        $admission = Admission::findOrFail($id);

        $validated = $request->validate([
            'discharge_date' => 'required|date',
            'discharge_summary' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $validated['status'] = 'discharged';
            $admission->update($validated);

            // Update bed status
            Bed::where('id', $admission->bed_id)->update(['status' => 'available']);

            DB::commit();

            return response()->json($admission);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to discharge patient'], 500);
        }
    }

    public function destroy($id)
    {
        $admission = Admission::findOrFail($id);

        DB::beginTransaction();
        try {
            // Free up bed if admission is deleted
            if ($admission->status === 'admitted') {
                Bed::where('id', $admission->bed_id)->update(['status' => 'available']);
            }

            $admission->delete();
            DB::commit();

            return response()->json(['message' => 'Admission deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to delete admission'], 500);
        }
    }
}
