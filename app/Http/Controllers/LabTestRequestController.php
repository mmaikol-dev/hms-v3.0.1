<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\LabTest;
use App\Models\LabTestRequest;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabTestRequestController extends Controller
{
    /**
     * Display a listing of lab test requests.
     */
    public function index(Request $request)
    {
        $query = LabTestRequest::with([
            'patient',
            'doctor',
            'labTest',
            'assignedTechnician',
        ]);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    })

                    ->orWhereHas('labTest', function ($q) use ($search) {
                        $q->where('test_name', 'like', "%{$search}%");
                    });
            });
        }

        $requests = $query->latest()->paginate(20);

        // Get technicians for assignment modal
        $technicians = User::where('role', 'lab_technician')->get();

        return Inertia::render('labtestrequests/index', [
            'requests' => $requests,
            'technicians' => $technicians,
        ]);
    }

    /**
     * Show the form for creating a new lab test request.
     */
    public function create()
    {
        // FIXED: Removed ->with('user')
        $patients = Patient::all();
        $doctors = Doctor::with('user')->get();

        $labTests = LabTest::where('is_active', true)->get();

        return Inertia::render('labtestrequests/create', [
            'patients' => $patients,
            'doctors' => Doctor::with('user')->get(),
            'labTests' => $labTests,
        ]);
    }

    /**
     * Store a newly created lab test request in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'lab_test_id' => 'required|exists:lab_tests,id',
            'requested_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Generate unique request number
        $validated['request_number'] = 'LAB-'.date('Ymd').'-'.str_pad(
            LabTestRequest::whereDate('created_at', today())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        $validated['status'] = 'pending';

        LabTestRequest::create($validated);

        return redirect()->route('labtestrequests.index')
            ->with('success', 'Lab test request created successfully.');
    }

    /**
     * Display the specified lab test request.
     */
    public function show($id)
    {
        $labRequest = LabTestRequest::with([
            'patient',
            'doctor',
            'labTest',
            'assignedTechnician',
        ])->findOrFail($id);

        return Inertia::render('labtestrequests/show', [
            'labRequest' => $labRequest,
        ]);
    }

    public function generateReport($id)
    {
        $labTestRequest = LabTestRequest::with(['patient', 'doctor', 'labTest'])->findOrFail($id);

        $pdf = \PDF::loadView('pdf.labtest-report', [
            'labTestRequest' => $labTestRequest,
        ]);

        $filename = 'LabTestReport_'.$labTestRequest->request_number.'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Update the specified lab test request in storage.
     */
    public function update(Request $request, $id)
    {
        $labRequest = LabTestRequest::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:pending,sample_collected,in_progress,completed,cancelled',
            'result' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // Auto-update timestamps based on status
        if ($request->has('status')) {
            if ($request->status === 'sample_collected' && ! $labRequest->sample_collected_at) {
                $validated['sample_collected_at'] = now();
            }

            if ($request->status === 'completed' && ! $labRequest->result_date) {
                $validated['result_date'] = now();
            }
        }

        $labRequest->update($validated);

        return back()->with('success', 'Lab test request updated successfully.');
    }

    /**
     * Remove the specified lab test request from storage.
     */
    public function destroy($id)
    {
        $labRequest = LabTestRequest::findOrFail($id);
        $labRequest->delete();

        return redirect()->route('labtest-requests.index')
            ->with('success', 'Lab test request deleted successfully.');
    }

    /**
     * Assign a technician to a lab test request.
     */
    public function assignTechnician(Request $request, $id)
    {
        $labRequest = LabTestRequest::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $labRequest->update($validated);

        return back()->with('success', 'Technician assigned successfully.');
    }

    /**
     * Submit result for a lab test request.
     */
    public function submitResult(Request $request, $id)
    {
        $labRequest = LabTestRequest::findOrFail($id);

        $validated = $request->validate([
            'result' => 'required|string',
            'report_file' => 'nullable|string',
        ]);

        $validated['status'] = 'completed';
        $validated['result_date'] = now();

        $labRequest->update($validated);

        return back()->with('success', 'Lab test result submitted successfully.');
    }
}
