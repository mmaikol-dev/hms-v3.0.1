<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $date = $request->input('date');

        $appointments = Appointment::with(['patient', 'doctor', 'department'])
            ->when($search, function ($query, $search) {
                $query->where('appointment_number', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhere('phone', 'like', "%{$search}%");
                    });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($date, function ($query, $date) {
                $query->whereDate('appointment_date', $date);
            })
            ->orderBy('appointment_date', 'desc')
            ->orderBy('token_number', 'asc')
            ->paginate(15);

        return inertia('appointments/index', [
            'appointments' => $appointments,
            'patients' => Patient::select('id', 'first_name', 'last_name', 'phone')->get(),
            'doctors' => User::select('id', 'name')->get(),
            'departments' => Department::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('appointments/create', [
            'patients' => Patient::select('id', 'first_name', 'last_name', 'phone')
                ->orderBy('first_name')
                ->get(),
            'doctors' => User::with('doctor.department')
                ->whereHas('doctor')
                ->select('id', 'name')
                ->get(),
            'departments' => Department::where('is_active', true)
                ->select('id', 'name')
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string'
        ], [
            'patient_id.required' => 'Please select a patient.',
            'doctor_id.required' => 'Please select a doctor.',
            'department_id.required' => 'Please select a department.',
            'appointment_date.required' => 'Appointment date is required.',
            'appointment_date.after_or_equal' => 'Appointment date cannot be in the past.',
        ]);

        // Generate appointment number
        $validated['appointment_number'] = 'APT' . date('Ymd') . str_pad(
            Appointment::whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );
        
        $validated['status'] = 'scheduled';
        
        // Generate token number for the day and doctor
        $validated['token_number'] = Appointment::whereDate('appointment_date', $validated['appointment_date'])
            ->where('doctor_id', $validated['doctor_id'])
            ->count() + 1;

        $appointment = Appointment::create($validated);

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment created successfully! Token: #' . $appointment->token_number);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $appointment = Appointment::with([
            'patient',
            'doctor.doctor.department',
            'department',
            'prescription.items.medicine',
            'medicalRecord'
        ])->findOrFail($id);
        
        return response()->json($appointment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $validated = $request->validate([
            'appointment_date' => 'sometimes|date|after_or_equal:today',
            'status' => 'sometimes|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string'
        ], [
            'appointment_date.after_or_equal' => 'Appointment date cannot be in the past.',
            'status.in' => 'Invalid status selected.',
        ]);

        // If date is changed, recalculate token number
        if (isset($validated['appointment_date']) && $validated['appointment_date'] !== $appointment->appointment_date->toDateString()) {
            $validated['token_number'] = Appointment::whereDate('appointment_date', $validated['appointment_date'])
                ->where('doctor_id', $appointment->doctor_id)
                ->where('id', '!=', $id)
                ->count() + 1;
        }

        $appointment->update($validated);

        return back()->with('success', 'Appointment updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        
        // Only allow deletion if not completed
        if ($appointment->status === 'completed') {
            return back()->withErrors([
                'delete' => 'Cannot delete completed appointments. Please cancel instead.'
            ]);
        }

        $appointment->delete();

        return back()->with('success', 'Appointment deleted successfully!');
    }

    /**
     * Check in appointment.
     */
    public function checkIn($id)
    {
        $appointment = Appointment::findOrFail($id);
        
        if (!in_array($appointment->status, ['scheduled', 'confirmed'])) {
            return back()->withErrors([
                'status' => 'Cannot check in this appointment.'
            ]);
        }

        $appointment->update([
            'status' => 'in_progress',
            'checked_in_at' => now()
        ]);

        return back()->with('success', 'Patient checked in successfully!');
    }

    /**
     * Check out appointment.
     */
    public function checkOut($id)
    {
        $appointment = Appointment::findOrFail($id);
        
        if ($appointment->status !== 'in_progress') {
            return back()->withErrors([
                'status' => 'Cannot check out this appointment.'
            ]);
        }

        $appointment->update([
            'status' => 'completed',
            'checked_out_at' => now()
        ]);

        return back()->with('success', 'Patient checked out successfully!');
    }

    /**
     * Get appointments by date.
     */
    public function getByDate(Request $request)
    {
        $date = $request->input('date', now()->toDateString());
        
        $appointments = Appointment::with(['patient', 'doctor', 'department'])
            ->whereDate('appointment_date', $date)
            ->orderBy('token_number')
            ->get();
        
        return response()->json($appointments);
    }

    /**
     * Get today's appointments for dashboard.
     */
    public function today()
    {
        $appointments = Appointment::with(['patient', 'doctor', 'department'])
            ->whereDate('appointment_date', today())
            ->orderBy('token_number')
            ->get();

        return inertia('appointments/today', [
            'appointments' => $appointments,
            'statistics' => [
                'total' => $appointments->count(),
                'scheduled' => $appointments->where('status', 'scheduled')->count(),
                'in_progress' => $appointments->where('status', 'in_progress')->count(),
                'completed' => $appointments->where('status', 'completed')->count(),
            ],
        ]);
    }
}