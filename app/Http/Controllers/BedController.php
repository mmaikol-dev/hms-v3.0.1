<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Ward;
use Illuminate\Http\Request;
use Inertia\Inertia;

  /**
     * Display a listing of the resource.
     */
   class BedController extends Controller
{
    public function index()
    {
        $beds = Bed::with(['ward', 'currentAdmission.patient'])->paginate(15);
        
    return inertia('beds/index', [
        'beds' => $beds
    ]);
    }

     public function create()
    {
        // Get all wards with their departments and bed counts
        $wards = Ward::with(['department'])
            ->withCount('beds')
            ->get()
            ->map(function ($ward) {
                return [
                    'id' => $ward->id,
                    'name' => $ward->name,
                    'type' => $ward->type,
                    'floor_number' => $ward->floor_number,
                    'total_beds' => $ward->total_beds,
                    'beds_count' => $ward->beds_count,
                    'is_active' => $ward->is_active,
                    'department' => $ward->department ? [
                        'id' => $ward->department->id,
                        'name' => $ward->department->name,
                    ] : null,
                ];
            });

        return Inertia::render('beds/create', [
            'wards' => $wards,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bed_number' => 'required|string|unique:beds,bed_number',
            'ward_id' => 'required|exists:wards,id',
            'charge_per_day' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        $validated['status'] = 'available';
        $bed = Bed::create($validated);
        return response()->json($bed->load('ward'), 201);
    }

    public function show($id)
    {
        $bed = Bed::with(['ward', 'admissions.patient', 'currentAdmission'])->findOrFail($id);
        return response()->json($bed);
    }

    public function update(Request $request, $id)
    {
        $bed = Bed::findOrFail($id);
        
        $validated = $request->validate([
            'bed_number' => 'string|unique:beds,bed_number,' . $id,
            'status' => 'in:available,occupied,maintenance,reserved',
            'charge_per_day' => 'numeric|min:0',
            'description' => 'nullable|string'
        ]);

        $bed->update($validated);
        return response()->json($bed->load('ward'));
    }

    public function destroy($id)
    {
        $bed = Bed::findOrFail($id);
        $bed->delete();
        return response()->json(['message' => 'Bed deleted successfully']);
    }

    public function getAvailable()
    {
        $beds = Bed::with('ward')->where('status', 'available')->get();
        return response()->json($beds);
    }
}
