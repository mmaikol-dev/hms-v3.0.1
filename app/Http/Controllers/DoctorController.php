<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $doctors = Doctor::with(['user', 'department'])
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                    ->orWhere('specialization', 'like', "%{$search}%")
                    ->orWhereHas('department', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->paginate(15);

        return inertia('doctors/index', [
            'doctors' => $doctors,
            'departments' => Department::all(),
            'users' => User::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('doctors/create', [
            'departments' => Department::select('id', 'name')->get(),
            'users' => User::select('id', 'name', 'email')
                ->whereDoesntHave('doctor')
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:doctors,user_id',
            'department_id' => 'required|exists:departments,id',
            'specialization' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'consultation_fee' => 'required|numeric|min:0',
            'biography' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'available_days' => 'nullable|array',
            'shift_start' => 'nullable|date_format:H:i',
            'shift_end' => 'nullable|date_format:H:i',
        ], [
            'user_id.required' => 'Please select a user account.',
            'user_id.unique' => 'This user already has a doctor profile.',
            'department_id.required' => 'Please select a department.',
            'specialization.required' => 'Specialization is required.',
            'qualification.required' => 'Qualification is required.',
            'consultation_fee.required' => 'Consultation fee is required.',
            'consultation_fee.min' => 'Consultation fee must be a positive number.',
            'experience_years.min' => 'Experience years cannot be negative.',
        ]);

        $doctor = Doctor::create($validated);

        return redirect()->route('doctors.index')
            ->with('success', 'Doctor created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $doctor = Doctor::with(['user', 'department', 'appointments', 'prescriptions'])
            ->findOrFail($id);

        return inertia('doctors/show', [
            'doctor' => $doctor,
        ]);
    }

    public function generateReport(Doctor $doctor)
    {
        // Load all necessary doctor relationships
        $doctor->load([
            'user',
            'department',
            'appointments.patient',
            'prescriptions.patient',
            'admissions.patient',
            'admissions.bed.ward',
        ]);

        // Generate PDF
        $pdf = Pdf::loadView('doctors.report', [
            'doctor' => $doctor,
        ]);

        $fileName = 'Doctor_Report_'.$doctor->id.'.pdf';

        return $pdf->download($fileName);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $validated = $request->validate([
            'department_id' => 'sometimes|exists:departments,id',
            'specialization' => 'sometimes|string|max:255',
            'qualification' => 'sometimes|string|max:255',
            'consultation_fee' => 'sometimes|numeric|min:0',
            'biography' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'available_days' => 'nullable|array',
            'shift_start' => 'nullable|date_format:H:i',
            'shift_end' => 'nullable|date_format:H:i',
        ], [
            'department_id.exists' => 'Selected department is invalid.',
            'consultation_fee.min' => 'Consultation fee must be a positive number.',
            'experience_years.min' => 'Experience years cannot be negative.',
        ]);

        $doctor->update($validated);

        return back()->with('success', 'Doctor updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->delete();

        return back()->with('success', 'Doctor deleted successfully!');
    }

    /**
     * Get doctor's schedule with appointments.
     */
    public function getSchedule($id)
    {
        $doctor = Doctor::with(['user', 'appointments' => function ($query) {
            $query->whereDate('appointment_date', '>=', now())
                ->orderBy('appointment_date')
                ->orderBy('appointment_time');
        }])->findOrFail($id);

        return response()->json($doctor);
    }
}
