<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf; 
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

    public function download($id)
    {
        $invoice = Invoice::with(['patient', 'items', 'payments.receivedBy'])
            ->findOrFail($id);

        $pdf = Pdf::loadView('invoice.invoice', [
            'invoice' => $invoice,
            'date' => now()->format('d/m/Y'),
        ]);

        $filename = 'invoice-' . $invoice->invoice_number . '-' . date('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    public function view($id)
    {
        $invoice = Invoice::with(['patient', 'items', 'payments.receivedBy'])
            ->findOrFail($id);

        return view('invoice.invoice', [
            'invoice' => $invoice,
            'date' => now()->format('d/m/Y'),
        ]);
    }

    public function create()
    {
        // Load patients from patients table with file_no and member_no
        $patients = Patient::select('id', 'first_name', 'last_name', 'file_no', 'member_no')
            ->orderBy('first_name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->first_name.' '.$p->last_name,
                    'file_no' => $p->file_no,
                    'member_no' => $p->member_no,
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
            'file_no' => 'nullable|string|max:255',
            'member_no' => 'nullable|string|max:255',
            'invoice_date' => 'required|date_format:Y-m-d\TH:i',
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
                'file_no' => $validated['file_no'] ?? null,
                'member_no' => $validated['member_no'] ?? null,
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'],
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'paid_amount' => 0,
            ];

            // Calculate subtotal - amount is NOT multiplied by quantity
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                // The unit_price field contains the total amount for all quantities
                $item['amount'] = $item['unit_price'];
                $subtotal += $item['amount'];
            }

            $invoiceData['subtotal'] = $subtotal;
            $invoiceData['total_amount'] = $subtotal + $invoiceData['tax_amount'] - $invoiceData['discount_amount'];

            $invoice = Invoice::create($invoiceData);

            // Create invoice items - amount equals unit_price (no multiplication)
            foreach ($validated['items'] as $item) {
                $item['amount'] = $item['unit_price'];
                $invoice->items()->create($item);
            }

            DB::commit();

            return redirect()->route('invoices.index')->with('success', 'Invoice created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to create invoice: ' . $e->getMessage())->withInput();
        }
    }

    public function show($id)
    {
        $invoice = Invoice::with(['patient', 'items', 'payments.receivedBy'])
            ->findOrFail($id);

        return inertia('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit($id)
    {
        return $this->show($id);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        // Only allow updates if invoice is pending
        if ($invoice->status !== 'pending') {
            return redirect()->back()->with('error', 'Cannot update invoice with status: ' . $invoice->status);
        }

        $validated = $request->validate([
            'file_no' => 'nullable|string|max:255',
            'member_no' => 'nullable|string|max:255',
            'invoice_date' => 'nullable|date_format:Y-m-d\TH:i',
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

            return redirect()->route('invoices.index')->with('success', 'Invoice updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to update invoice: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);

        // Only allow deletion if no payments made
        if ($invoice->paid_amount > 0) {
            return redirect()->back()->with('error', 'Cannot delete invoice with payments.');
        }

        try {
            $invoice->delete();
            return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete invoice: ' . $e->getMessage());
        }
    }

    public function getPending()
    {
        $invoices = Invoice::with(['patient', 'items'])
            ->where('status', 'pending')
            ->orderBy('due_date')
            ->get();

        return inertia('invoices/pending', [
            'invoices' => $invoices,
        ]);
    }

    public function getOverdue()
    {
        $invoices = Invoice::with(['patient', 'items'])
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->get();

        return inertia('invoices/overdue', [
            'invoices' => $invoices,
        ]);
    }

    public function getByPatient($patientId)
    {
        $invoices = Invoice::with(['items', 'payments'])
            ->where('patient_id', $patientId)
            ->orderBy('invoice_date', 'desc')
            ->get();

        return inertia('invoices/patient', [
            'invoices' => $invoices,
            'patient' => Patient::findOrFail($patientId),
        ]);
    }
}
