<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecords;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    public function index()
    {
        $records = MedicalRecord::with(['patient', 'doctor', 'appointment'])
            ->orderBy('visit_date', 'desc')
            ->paginate(15);
         return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'visit_date' => 'required|date',
            'chief_complaint' => 'required|string',
            'vital_signs' => 'nullable|array',
            'vital_signs.temperature' => 'nullable|numeric',
            'vital_signs.blood_pressure' => 'nullable|string',
            'vital_signs.heart_rate' => 'nullable|integer',
            'vital_signs.respiratory_rate' => 'nullable|integer',
            'vital_signs.oxygen_saturation' => 'nullable|numeric',
            'vital_signs.weight' => 'nullable|numeric',
            'vital_signs.height' => 'nullable|numeric',
            'examination_notes' => 'nullable|string',
            'diagnosis' => 'required|string',
            'treatment_given' => 'nullable|string',
            'follow_up_instructions' => 'nullable|string'
        ]);

        $record = MedicalRecord::create($validated);
        return response()->json($record->load(['patient', 'doctor', 'appointment']), 201);
    }

    public function show($id)
    {
        $record = MedicalRecord::with(['patient', 'doctor', 'appointment'])
            ->findOrFail($id);
        return response()->json($record);
    }

    public function update(Request $request, $id)
    {
        $record = MedicalRecord::findOrFail($id);
        
        $validated = $request->validate([
            'chief_complaint' => 'string',
            'vital_signs' => 'nullable|array',
            'examination_notes' => 'nullable|string',
            'diagnosis' => 'string',
            'treatment_given' => 'nullable|string',
            'follow_up_instructions' => 'nullable|string'
        ]);

        $record->update($validated);
        return response()->json($record->load(['patient', 'doctor', 'appointment']));
    }

    public function destroy($id)
    {
        $record = MedicalRecord::findOrFail($id);
        $record->delete();
        return response()->json(['message' => 'Medical record deleted successfully']);
    }

    public function getByPatient($patientId)
    {
        $records = MedicalRecord::with(['doctor', 'appointment'])
            ->where('patient_id', $patientId)
            ->orderBy('visit_date', 'desc')
            ->get();
        return response()->json($records);
    }

    public function getByAppointment($appointmentId)
    {
        $record = MedicalRecord::with(['patient', 'doctor'])
            ->where('appointment_id', $appointmentId)
            ->first();
        return response()->json($record);
    }

    public function search(Request $request)
    {
        $query = MedicalRecord::with(['patient', 'doctor']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->has('diagnosis')) {
            $query->where('diagnosis', 'like', '%' . $request->diagnosis . '%');
        }

        if ($request->has('from_date')) {
            $query->whereDate('visit_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('visit_date', '<=', $request->to_date);
        }

        $records = $query->orderBy('visit_date', 'desc')->paginate(15);
        return response()->json($records);
    }
}