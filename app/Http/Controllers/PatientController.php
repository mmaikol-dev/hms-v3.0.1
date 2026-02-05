<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patients = Patient::with('appointments')->latest()->paginate(15);

        return inertia('patients/index', [
            'patients' => $patients,
        ]);
    }

   public function store(Request $request)
{
    $validated = $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'email' => 'nullable|email|unique:patients,email',
        'phone' => 'required|string|max:20',
        'date_of_birth' => 'required|date',
        'gender' => 'required|in:male,female,other',
        'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        'address' => 'required|string',
        'city' => 'required|string|max:100',
        'state' => 'required|string|max:100',
        'zip_code' => 'nullable|string|max:10',
        'emergency_contact_name' => 'nullable|string|max:255',
        'emergency_contact_phone' => 'nullable|string|max:20',
        'emergency_contact_relation' => 'nullable|string|max:100',
        'medical_history' => 'nullable|string',
        'allergies' => 'nullable|string',
        'insurance_provider' => 'nullable|string|max:255',
        'insurance_policy_number' => 'nullable|string|max:100',
        'file_no' => 'nullable|string|max:50|unique:patients,file_no',
    ]);

    /*
     |-------------------------------------------------
     | Generate unique patient_id (safe version)
     |-------------------------------------------------
     */
    $nextId = (Patient::max('id') ?? 0) + 1;
    $validated['patient_id'] = 'PAT' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

    /*
     |-------------------------------------------------
     | Generate file_no automatically if not provided
     | Format: FILE20260121XXXX
     |-------------------------------------------------
     */
    if (empty($validated['file_no'])) {
        do {
            $validated['file_no'] = 'FILE' . now()->format('Ymd') . rand(1000, 9999);
        } while (Patient::where('file_no', $validated['file_no'])->exists());
    }

    $patient = Patient::create($validated);

    return redirect()->route('patients.index')
        ->with('success', 'Patient created successfully');
}


    public function generateReport(Patient $patient)
    {
        // Load other existing relationships + admissions
        $patient->load([
            'appointments',
            'labTestRequests.labTest',
            'invoices.payments',
            'admissions.doctor',
            'admissions.bed',
        ]);

        // Pass data to PDF view
        $pdf = Pdf::loadView('patients.report', [
            'patient' => $patient,
        ]);

        $fileName = 'Patient_Report_'.$patient->id.'.pdf';

        return $pdf->download($fileName);
    }

    public function create()
    {
        return inertia('patients/create');
    }

    public function show($id)
    {
        $patient = Patient::with([
            'appointments.doctor',
            'admissions.bed.ward',
            'prescriptions.items.medicine',
            'labTestRequests.labTest',
            'medicalRecords',
            'invoices.payments',
        ])->findOrFail($id);

        return inertia('patients/show', [
            'patient' => $patient,
        ]);
    }

    public function update(Request $request, $id)
{
    try {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:patients,email,'.$id,
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'required|in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'address' => 'nullable|string',
            'national_id' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:10',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_policy_number' => 'nullable|string|max:100',
            'file_no' => 'nullable|string|max:50',
        ]);

        $patient->update($validated);

        return redirect()->back()->with('success', 'Patient updated successfully');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Failed to update patient: ' . $e->getMessage());
    }
}

    public function destroy($id)
    {
        try {
            $patient = Patient::findOrFail($id);
            $patient->delete();

            return redirect()->back()->with('success', 'Patient deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete patient: ' . $e->getMessage());
        }
    }

    public function search(Request $request)
    {
        $query = Patient::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_id', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('file_no', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate(15);

        return response()->json($patients);
    }
}