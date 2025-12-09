<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineController extends Controller
{
    public function index()
    {
        $medicines = Medicine::paginate(15);
       return inertia('medicines/index', [
        'medicines' => $medicines
    ]);
    }


    public function create()
{
    return inertia('medicines/create');
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'category' => 'required|string|max:100',
            'manufacturer' => 'nullable|string|max:255',
            'unit_price' => 'required|numeric|min:0',
            'quantity_in_stock' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'description' => 'nullable|string',
            'dosage_form' => 'nullable|string|max:50',
            'strength' => 'nullable|string|max:50'
        ]);

        $medicine = Medicine::create($validated);
        return response()->json($medicine, 201);
    }

    public function show($id)
    {
        $medicine = Medicine::with('prescriptionItems')->findOrFail($id);
        return response()->json($medicine);
    }

    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'category' => 'string|max:100',
            'manufacturer' => 'nullable|string|max:255',
            'unit_price' => 'numeric|min:0',
            'quantity_in_stock' => 'integer|min:0',
            'reorder_level' => 'integer|min:0',
            'expiry_date' => 'nullable|date',
            'description' => 'nullable|string',
            'dosage_form' => 'nullable|string|max:50',
            'strength' => 'nullable|string|max:50',
            'is_active' => 'boolean'
        ]);

        $medicine->update($validated);
        return response()->json($medicine);
    }

    public function destroy($id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->delete();
        return response()->json(['message' => 'Medicine deleted successfully']);
    }

    public function getLowStock()
    {
        $medicines = Medicine::whereColumn('quantity_in_stock', '<=', 'reorder_level')
            ->where('is_active', true)
            ->get();
        return response()->json($medicines);
    }

    public function search(Request $request)
    {
        $query = Medicine::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        $medicines = $query->where('is_active', true)->paginate(15);
        return response()->json($medicines);
    }
}