<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index()
    {
        return Inertia::render('bills/index', [
            'bills' => Bill::with('patient')->latest()->paginate(20)
        ]);
    }

    public function create()
    {
        return Inertia::render('bills/create', [
            'patients' => Patient::select('id','first_name','last_name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'amount' => 'required|numeric',
            'status' => 'nullable|in:unpaid,paid,pending',
            'description' => 'nullable|string',
        ]);

        Bill::create($validated);

        return redirect()->route('bills.index')->with('success', 'Bill created');
    }

    public function show(Bill $bill)
    {
        return Inertia::render('bills/show', [
            'bill' => $bill->load('patient')
        ]);
    }

    public function edit(Bill $bill)
    {
        return Inertia::render('bills/edit', [
            'bill' => $bill,
            'patients' => Patient::all(),
        ]);
    }

    public function update(Request $request, Bill $bill)
    {
        $validated = $request->validate([
            'amount' => 'nullable|numeric',
            'status' => 'nullable|in:unpaid,paid,pending',
            'description' => 'nullable|string',
        ]);

        $bill->update($validated);

        return redirect()->route('bills.index')->with('success', 'Bill updated');
    }

    public function destroy(Bill $bill)
    {
        $bill->delete();
        return back()->with('success', 'Bill deleted');
    }
}
