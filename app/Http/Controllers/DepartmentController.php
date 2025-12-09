<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $departments = Department::with('users')
            ->withCount('doctors')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('head_of_department', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->paginate(15);

        return inertia('departments/index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('departments/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'head_of_department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean'
        ], [
            'name.required' => 'Department name is required.',
            'name.unique' => 'A department with this name already exists.',
            'phone.max' => 'Phone number cannot exceed 20 characters.',
        ]);

        $department = Department::create($validated);

        return redirect()->route('departments.index')
            ->with('success', 'Department created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $department = Department::with(['users', 'doctors.user', 'wards'])
            ->findOrFail($id);
        
        return response()->json($department);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
            'head_of_department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean'
        ], [
            'name.unique' => 'A department with this name already exists.',
            'phone.max' => 'Phone number cannot exceed 20 characters.',
        ]);

        $department->update($validated);

        return back()->with('success', 'Department updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        
        // Check if department has doctors
        if ($department->doctors()->count() > 0) {
            return back()->withErrors([
                'delete' => 'Cannot delete department with assigned doctors. Please reassign them first.'
            ]);
        }

        $department->delete();

        return back()->with('success', 'Department deleted successfully!');
    }

    /**
     * Get department statistics.
     */
    public function statistics($id)
    {
        $department = Department::withCount([
            'doctors',
            'users',
            'appointments',
            'wards'
        ])->findOrFail($id);

        return response()->json($department);
    }
}