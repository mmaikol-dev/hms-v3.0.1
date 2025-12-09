<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['patient:id,first_name,last_name', 'items', 'payments'])
            ->orderBy('invoice_date', 'desc')
            ->paginate(15);

        return inertia('invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    public function create()
    {
        // Load patients from patients table
        $patients = Patient::select('id', 'first_name', 'last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->first_name.' '.$p->last_name,
                ];
            });

        return inertia('invoices/create', [
            'patients' => $patients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|in:consultation,medicine,lab_test,bed_charge,procedure,ambulance,other',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Generate invoice number
            $invoiceData = [
                'invoice_number' => 'INV'.date('Ymd').str_pad(Invoice::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT),
                'patient_id' => $validated['patient_id'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'],
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'paid_amount' => 0,
            ];

            // Calculate subtotal
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $item['amount'] = $item['quantity'] * $item['unit_price'];
                $subtotal += $item['amount'];
            }

            $invoiceData['subtotal'] = $subtotal;
            $invoiceData['total_amount'] = $subtotal + $invoiceData['tax_amount'] - $invoiceData['discount_amount'];

            $invoice = Invoice::create($invoiceData);

            // Create invoice items
            foreach ($validated['items'] as $item) {
                $item['amount'] = $item['quantity'] * $item['unit_price'];
                $invoice->items()->create($item);
            }

            DB::commit();

            return response()->json($invoice->load(['patient', 'items', 'payments']), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to create invoice: '.$e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $invoice = Invoice::with(['patient', 'items', 'payments.receivedBy'])
            ->findOrFail($id);

        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        // Only allow updates if invoice is pending
        if ($invoice->status !== 'pending') {
            return response()->json(['error' => 'Cannot update invoice with status: '.$invoice->status], 400);
        }

        $validated = $request->validate([
            'due_date' => 'date|after_or_equal:invoice_date',
            'tax_amount' => 'numeric|min:0',
            'discount_amount' => 'numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Recalculate total if tax or discount changed
            if (isset($validated['tax_amount']) || isset($validated['discount_amount'])) {
                $taxAmount = $validated['tax_amount'] ?? $invoice->tax_amount;
                $discountAmount = $validated['discount_amount'] ?? $invoice->discount_amount;
                $validated['total_amount'] = $invoice->subtotal + $taxAmount - $discountAmount;
            }

            $invoice->update($validated);
            DB::commit();

            return response()->json($invoice->load(['patient', 'items', 'payments']));
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to update invoice'], 500);
        }
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);

        // Only allow deletion if no payments made
        if ($invoice->paid_amount > 0) {
            return response()->json(['error' => 'Cannot delete invoice with payments'], 400);
        }

        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }

    public function getPending()
    {
        $invoices = Invoice::with(['patient', 'items'])
            ->where('status', 'pending')
            ->orderBy('due_date')
            ->get();

        return response()->json($invoices);
    }

    public function getOverdue()
    {
        $invoices = Invoice::with(['patient', 'items'])
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->get();

        return response()->json($invoices);
    }

    public function getByPatient($patientId)
    {
        $invoices = Invoice::with(['items', 'payments'])
            ->where('patient_id', $patientId)
            ->orderBy('invoice_date', 'desc')
            ->get();

        return response()->json($invoices);
    }
}
