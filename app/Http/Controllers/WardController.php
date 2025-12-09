<?php

namespace App\Http\Controllers;

use App\Models\Ward;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WardController extends Controller
{
    /**
     * Display a listing of wards.
     */
    public function index(Request $request)
    {
        $query = Ward::with(['department', 'beds'])->withCount('beds');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $wards = $query->latest()->paginate(15);
        $departments = Department::all();

        return Inertia::render('wards/index', [
            'wards' => $wards,
            'departments' => $departments,
        ]);
    }

    /**
     * Show the form for creating a new ward.
     */
    public function create()
    {
        $departments = Department::all();

        return Inertia::render('wards/create', [
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created ward in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:general,private,icu,emergency,maternity,pediatric',
            'floor_number' => 'required|integer',
            'total_beds' => 'required|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'boolean'
        ]);

        Ward::create($validated);

        return redirect()->route('wards.index')
            ->with('success', 'Ward created successfully.');
    }

    /**
     * Display the specified ward.
     */
    public function show($id)
    {
        $ward = Ward::with(['department', 'beds.currentAdmission.patient'])
            ->findOrFail($id);

        return Inertia::render('wards/show', [
            'ward' => $ward,
        ]);
    }

    /**
     * Update the specified ward in storage.
     */
    public function update(Request $request, $id)
    {
        $ward = Ward::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:general,private,icu,emergency,maternity,pediatric',
            'floor_number' => 'sometimes|integer',
            'total_beds' => 'sometimes|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'sometimes|boolean'
        ]);

        $ward->update($validated);

        return back()->with('success', 'Ward updated successfully.');
    }

    /**
     * Remove the specified ward from storage.
     */
    public function destroy($id)
    {
        $ward = Ward::findOrFail($id);
        
        // Check if ward has beds
        if ($ward->beds()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete ward with existing beds. Please remove all beds first.']);
        }

        $ward->delete();

        return redirect()->route('wards.index')
            ->with('success', 'Ward deleted successfully.');
    }
}