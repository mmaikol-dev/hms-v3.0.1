<?php

namespace App\Http\Controllers;

use App\Models\Ambulance;
use Illuminate\Http\Request;

class AmbulanceController extends Controller
{
    public function index()
    {
        $ambulances = Ambulance::with(['driver', 'trips'])
            ->withCount('trips')
            ->paginate(15);
        return response()->json($ambulances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_number' => 'required|string|unique:ambulances,vehicle_number',
            'vehicle_model' => 'required|string|max:255',
            'year_of_manufacture' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'driver_id' => 'nullable|exists:users,id',
            'vehicle_type' => 'required|in:basic,advanced,air,neonatal,bariatric',
            'insurance_expiry' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date',
            'charge_per_km' => 'required|numeric|min:0'
        ]);

        $validated['status'] = 'available';
        $ambulance = Ambulance::create($validated);
        
        return response()->json($ambulance->load('driver'), 201);
    }

    public function show($id)
    {
        $ambulance = Ambulance::with(['driver', 'trips.patient'])
            ->findOrFail($id);
        return response()->json($ambulance);
    }

    public function update(Request $request, $id)
    {
        $ambulance = Ambulance::findOrFail($id);
        
        $validated = $request->validate([
            'vehicle_number' => 'string|unique:ambulances,vehicle_number,' . $id,
            'vehicle_model' => 'string|max:255',
            'year_of_manufacture' => 'integer|min:1900|max:' . (date('Y') + 1),
            'driver_id' => 'nullable|exists:users,id',
            'vehicle_type' => 'in:basic,advanced,air,neonatal,bariatric',
            'status' => 'in:available,on_trip,maintenance,out_of_service',
            'insurance_expiry' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date',
            'charge_per_km' => 'numeric|min:0'
        ]);

        $ambulance->update($validated);
        return response()->json($ambulance->load('driver'));
    }

    public function destroy($id)
    {
        $ambulance = Ambulance::findOrFail($id);
        
        // Check if ambulance has active trips
        $hasActiveTrips = $ambulance->trips()->whereIn('status', ['scheduled', 'in_progress'])->exists();
        
        if ($hasActiveTrips) {
            return response()->json(['error' => 'Cannot delete ambulance with active trips'], 400);
        }

        $ambulance->delete();
        return response()->json(['message' => 'Ambulance deleted successfully']);
    }

    public function getAvailable()
    {
        $ambulances = Ambulance::with('driver')
            ->where('status', 'available')
            ->get();
        return response()->json($ambulances);
    }

    public function updateStatus(Request $request, $id)
    {
        $ambulance = Ambulance::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:available,on_trip,maintenance,out_of_service'
        ]);

        $ambulance->update($validated);
        return response()->json($ambulance);
    }

    public function getMaintenanceDue()
    {
        $threeMonthsAgo = now()->subMonths(3);
        
        $ambulances = Ambulance::with('driver')
            ->where(function($query) use ($threeMonthsAgo) {
                $query->whereNull('last_maintenance_date')
                      ->orWhere('last_maintenance_date', '<=', $threeMonthsAgo);
            })
            ->get();
            
        return response()->json($ambulances);
    }

    public function getInsuranceExpiring()
    {
        $oneMonthFromNow = now()->addMonth();
        
        $ambulances = Ambulance::with('driver')
            ->where('insurance_expiry', '<=', $oneMonthFromNow)
            ->where('insurance_expiry', '>=', now())
            ->orderBy('insurance_expiry')
            ->get();
            
        return response()->json($ambulances);
    }
}