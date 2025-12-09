<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index()
    {
        return Inertia::render('visits/index', [
            'visits' => Visit::with(['patient','doctor'])->latest()->paginate(20)
        ]);
    }

    public function create()
    {
        return Inertia::render('visits/create', [
            'patients' => Patient::select('id','first_name','last_name')->get(),
            'doctors' => Doctor::select('id','first_name','last_name')->get(),
            'appointments' => Appointment::select('id','appointment_date')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'prescription' => 'nullable|string',
        ]);

        Visit::create($validated);

        return redirect()->route('visits.index')->with('success', 'Visit created');
    }

    public function show(Visit $visit)
    {
        return Inertia::render('visits/show', [
            'visit' => $visit->load(['patient','doctor','appointment'])
        ]);
    }

    public function edit(Visit $visit)
    {
        return Inertia::render('visits/edit', [
            'visit' => $visit,
            'patients' => Patient::select('id','first_name','last_name')->get(),
            'doctors' => Doctor::select('id','first_name','last_name')->get(),
            'appointments' => Appointment::select('id','appointment_date')->get(),
        ]);
    }

    public function update(Request $request, Visit $visit)
    {
        $validated = $request->validate([
            'symptoms' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'prescription' => 'nullable|string',
        ]);

        $visit->update($validated);

        return redirect()->route('visits.index')->with('success', 'Visit updated');
    }

    public function destroy(Visit $visit)
    {
        $visit->delete();
        return back()->with('success', 'Visit deleted');
    }
}
