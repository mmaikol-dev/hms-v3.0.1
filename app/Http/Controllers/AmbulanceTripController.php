<?php

namespace App\Http\Controllers;

use App\Models\AmbulanceTrips;
use Illuminate\Http\Request;

class AmbulanceTripController extends Controller
{
    public function index()
    {
        $trips = AmbulanceTrip::with(['ambulance', 'patient', 'driver'])
            ->orderBy('pickup_time', 'desc')
            ->paginate(15);
        return response()->json($trips);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ambulance_id' => 'required|exists:ambulances,id',
            'patient_id' => 'required|exists:patients,id',
            'driver_id' => 'required|exists:users,id',
            'pickup_location' => 'required|string',
            'dropoff_location' => 'required|string',
            'pickup_time' => 'required|date',
            'distance_km' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Check ambulance availability
            $ambulance = Ambulance::findOrFail($validated['ambulance_id']);
            
            if ($ambulance->status !== 'available') {
                return response()->json(['error' => 'Ambulance is not available'], 400);
            }

            // Generate trip number
            $tripData = array_merge($validated, [
                'trip_number' => 'AMB' . date('Ymd') . str_pad(AmbulanceTrip::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT),
                'status' => 'scheduled'
            ]);

            // Calculate charge if distance provided
            if (isset($validated['distance_km'])) {
                $tripData['charge'] = $validated['distance_km'] * $ambulance->charge_per_km;
            }

            $trip = AmbulanceTrip::create($tripData);

            // Update ambulance status
            $ambulance->update(['status' => 'on_trip']);

            DB::commit();
            return response()->json($trip->load(['ambulance', 'patient', 'driver']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create trip: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $trip = AmbulanceTrip::with(['ambulance', 'patient', 'driver'])
            ->findOrFail($id);
        return response()->json($trip);
    }

    public function update(Request $request, $id)
    {
        $trip = AmbulanceTrip::findOrFail($id);
        
        $validated = $request->validate([
            'pickup_location' => 'string',
            'dropoff_location' => 'string',
            'pickup_time' => 'date',
            'dropoff_time' => 'nullable|date|after:pickup_time',
            'distance_km' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        // Recalculate charge if distance updated
        if (isset($validated['distance_km']) && $validated['distance_km'] != $trip->distance_km) {
            $ambulance = $trip->ambulance;
            $validated['charge'] = $validated['distance_km'] * $ambulance->charge_per_km;
        }

        $trip->update($validated);
        return response()->json($trip->load(['ambulance', 'patient', 'driver']));
    }

    public function startTrip($id)
    {
        $trip = AmbulanceTrip::findOrFail($id);
        
        if ($trip->status !== 'scheduled') {
            return response()->json(['error' => 'Trip cannot be started'], 400);
        }

        $trip->update([
            'status' => 'in_progress',
            'pickup_time' => now()
        ]);

        return response()->json($trip);
    }

    public function completeTrip(Request $request, $id)
    {
        $trip = AmbulanceTrip::findOrFail($id);
        
        if ($trip->status !== 'in_progress') {
            return response()->json(['error' => 'Trip is not in progress'], 400);
        }

        $validated = $request->validate([
            'dropoff_time' => 'nullable|date',
            'distance_km' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Calculate charge
            $ambulance = $trip->ambulance;
            $charge = $validated['distance_km'] * $ambulance->charge_per_km;

            $trip->update([
                'status' => 'completed',
                'dropoff_time' => $validated['dropoff_time'] ?? now(),
                'distance_km' => $validated['distance_km'],
                'charge' => $charge,
                'notes' => $validated['notes'] ?? $trip->notes
            ]);

            // Update ambulance status
            $ambulance->update(['status' => 'available']);

            DB::commit();
            return response()->json($trip);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to complete trip'], 500);
        }
    }

    public function cancelTrip($id)
    {
        $trip = AmbulanceTrip::findOrFail($id);
        
        if (!in_array($trip->status, ['scheduled', 'in_progress'])) {
            return response()->json(['error' => 'Trip cannot be cancelled'], 400);
        }

        DB::beginTransaction();
        try {
            $trip->update(['status' => 'cancelled']);

            // Free up ambulance
            $trip->ambulance->update(['status' => 'available']);

            DB::commit();
            return response()->json($trip);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to cancel trip'], 500);
        }
    }

    public function destroy($id)
    {
        $trip = AmbulanceTrip::findOrFail($id);
        
        if ($trip->status === 'in_progress') {
            return response()->json(['error' => 'Cannot delete trip in progress'], 400);
        }

        $trip->delete();
        return response()->json(['message' => 'Trip deleted successfully']);
    }

    public function getByPatient($patientId)
    {
        $trips = AmbulanceTrip::with(['ambulance', 'driver'])
            ->where('patient_id', $patientId)
            ->orderBy('pickup_time', 'desc')
            ->get();
        return response()->json($trips);
    }

    public function getByAmbulance($ambulanceId)
    {
        $trips = AmbulanceTrip::with(['patient', 'driver'])
            ->where('ambulance_id', $ambulanceId)
            ->orderBy('pickup_time', 'desc')
            ->get();
        return response()->json($trips);
    }

    public function getActive()
    {
        $trips = AmbulanceTrip::with(['ambulance', 'patient', 'driver'])
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('pickup_time')
            ->get();
        return response()->json($trips);
    }
}