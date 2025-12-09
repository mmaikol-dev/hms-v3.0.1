<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    public function index()
    {
        $items = InventoryItem::orderBy('item_name')->paginate(15);
      return inertia('inventoryitems/index', [
        'items' => $items
    ]);
    }
public function create()
{
    return inertia('inventoryitems/create');
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'item_code' => 'required|string|unique:inventory_items,item_code',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'unit_of_measure' => 'required|string|max:50',
            'quantity_in_stock' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'last_purchase_date' => 'nullable|date'
        ]);

        $item = InventoryItem::create($validated);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = InventoryItem::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        
        $validated = $request->validate([
            'item_name' => 'string|max:255',
            'item_code' => 'string|unique:inventory_items,item_code,' . $id,
            'category' => 'string|max:100',
            'description' => 'nullable|string',
            'unit_of_measure' => 'string|max:50',
            'quantity_in_stock' => 'integer|min:0',
            'reorder_level' => 'integer|min:0',
            'unit_cost' => 'numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'last_purchase_date' => 'nullable|date',
            'is_active' => 'boolean'
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Inventory item deleted successfully']);
    }

    public function getLowStock()
    {
        $items = InventoryItem::whereColumn('quantity_in_stock', '<=', 'reorder_level')
            ->where('is_active', true)
            ->orderBy('quantity_in_stock')
            ->get();
        return response()->json($items);
    }

    public function adjustStock(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        
        $validated = $request->validate([
            'quantity' => 'required|integer',
            'type' => 'required|in:add,subtract,set',
            'reason' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $currentStock = $item->quantity_in_stock;
            
            switch ($validated['type']) {
                case 'add':
                    $newStock = $currentStock + $validated['quantity'];
                    break;
                case 'subtract':
                    $newStock = $currentStock - $validated['quantity'];
                    if ($newStock < 0) {
                        return response()->json(['error' => 'Insufficient stock'], 400);
                    }
                    break;
                case 'set':
                    $newStock = $validated['quantity'];
                    break;
            }

            $item->update(['quantity_in_stock' => $newStock]);

            DB::commit();
            return response()->json($item);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to adjust stock'], 500);
        }
    }

    public function getByCategory($category)
    {
        $items = InventoryItem::where('category', $category)
            ->where('is_active', true)
            ->orderBy('item_name')
            ->get();
        return response()->json($items);
    }

    public function search(Request $request)
    {
        $query = InventoryItem::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                  ->orWhere('item_code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $items = $query->where('is_active', true)->paginate(15);
        return response()->json($items);
    }
}