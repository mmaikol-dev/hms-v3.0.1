<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabTestController extends Controller
{
    /**
     * Display a listing of lab tests.
     */
    public function index(Request $request)
    {
        $query = LabTest::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('test_name', 'like', "%{$search}%")
                  ->orWhere('test_code', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $labTests = $query->latest()->paginate(15);

        return Inertia::render('labtests/index', [
            'labTests' => $labTests,
        ]);
    }

    /**
     * Show the form for creating a new lab test.
     */
    public function create()
    {
        return Inertia::render('labtests/create');
    }

    /**
     * Store a newly created lab test in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'test_name' => 'required|string|max:255',
            'test_code' => 'required|string|unique:lab_tests,test_code',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'normal_duration_hours' => 'required|integer|min:1',
            'preparation_instructions' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        LabTest::create($validated);

        return redirect()->route('labtests.index')
            ->with('success', 'Lab test created successfully.');
    }

    /**
     * Display the specified lab test.
     */
    public function show($id)
    {
        $labTest = LabTest::with('requests')->findOrFail($id);

        return Inertia::render('labtests/show', [
            'labTest' => $labTest,
        ]);
    }

    /**
     * Update the specified lab test in storage.
     */
    public function update(Request $request, $id)
    {
        $labTest = LabTest::findOrFail($id);
        
        $validated = $request->validate([
            'test_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'normal_duration_hours' => 'sometimes|integer|min:1',
            'preparation_instructions' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);

        $labTest->update($validated);

        return back()->with('success', 'Lab test updated successfully.');
    }

    /**
     * Remove the specified lab test from storage.
     */
    public function destroy($id)
    {
        $labTest = LabTest::findOrFail($id);
        $labTest->delete();

        return redirect()->route('labtests.index')
            ->with('success', 'Lab test deleted successfully.');
    }
}