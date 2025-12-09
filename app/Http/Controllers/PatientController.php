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
        // dd($request->all());
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
        ]);

        // Generate unique patient ID
        $validated['patient_id'] = 'PAT'.str_pad(Patient::count() + 1, 6, '0', STR_PAD_LEFT);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
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
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'string|max:255',
            'last_name' => 'string|max:255',
            'email' => 'nullable|email|unique:patients,email,'.$id,
            'phone' => 'string|max:20',
            'date_of_birth' => 'date',
            'gender' => 'in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'address' => 'string',
            'city' => 'string|max:100',
            'state' => 'string|max:100',
            'zip_code' => 'nullable|string|max:10',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_policy_number' => 'nullable|string|max:100',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
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
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate(15);

        return response()->json($patients);
    }
}
