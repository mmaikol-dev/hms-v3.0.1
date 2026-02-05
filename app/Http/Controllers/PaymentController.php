<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['invoice.patient', 'patient', 'receivedBy'])
            ->orderBy('payment_date', 'desc');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('invoice', function ($q) use ($search) {
                        $q->where('invoice_number', 'like', "%{$search}%")
                            ->orWhereHas('patient', function ($q) use ($search) {
                                $q->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%");
                            });
                    });
            });
        }

        // Date filter
        if ($request->has('date') && $request->date) {
            $query->whereDate('payment_date', $request->date);
        }

        $payments = $query->paginate(15);

        // Calculate statistics
        $stats = [
            'total_count' => Payment::count(),
            'total_amount' => Payment::sum('amount'),
            'today_count' => Payment::whereDate('payment_date', today())->count(),
            'today_amount' => Payment::whereDate('payment_date', today())->sum('amount'),
            'month_amount' => Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'),
        ];

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function create()
    {
        // Get unpaid or partially paid invoices
        $invoices = Invoice::with('patient')
            ->whereIn('status', ['pending', 'partially_paid'])
            ->whereRaw('total_amount > paid_amount')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all users who can receive payments (e.g., cashiers, admins)
        $users = User::whereIn('role', ['admin', 'cashier', 'receptionist'])
            ->orderBy('name')
            ->get();

        return Inertia::render('payments/create', [
            'invoices' => $invoices,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,bank_transfer,mobile_money,insurance,cheque',
            'transaction_id' => 'nullable|string|max:255',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
            'received_by' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            $invoice = Invoice::findOrFail($validated['invoice_id']);

            // Check if payment amount exceeds balance
            if ($validated['amount'] > $invoice->balance) {
                return back()->withErrors(['amount' => 'Payment amount exceeds invoice balance']);
            }

            // Generate payment number
            $paymentData = array_merge($validated, [
                'payment_number' => 'PAY'.date('Ymd').str_pad(
                    Payment::whereDate('created_at', today())->count() + 1,
                    4,
                    '0',
                    STR_PAD_LEFT
                ),
                'patient_id' => $invoice->patient_id,
            ]);

            $payment = Payment::create($paymentData);

            // Update invoice paid amount and status
            $newPaidAmount = $invoice->paid_amount + $validated['amount'];
            $invoice->update([
                'paid_amount' => $newPaidAmount,
                'status' => $newPaidAmount >= $invoice->total_amount ? 'paid' : 'partially_paid',
            ]);

            DB::commit();

            return redirect()->route('payments.index')
                ->with('success', 'Payment recorded successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to process payment: '.$e->getMessage()]);
        }
    }

    public function show($id)
    {
        $payment = Payment::with(['invoice.patient', 'patient', 'receivedBy'])
            ->findOrFail($id);

        return Inertia::render('payments/show', [
            'payment' => $payment,
        ]);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'transaction_id' => 'nullable|string|max:255',
        ]);

        $payment->update($validated);

        return redirect()->route('payments.index')
            ->with('success', 'Payment updated successfully');
    }

    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);

        DB::beginTransaction();
        try {
            $invoice = $payment->invoice;

            // Reverse payment on invoice
            $newPaidAmount = $invoice->paid_amount - $payment->amount;
            $invoice->update([
                'paid_amount' => $newPaidAmount,
                'status' => $newPaidAmount <= 0 ? 'pending' : 'partially_paid',
            ]);

            $payment->delete();
            DB::commit();

            return redirect()->route('payments.index')
                ->with('success', 'Payment deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to delete payment']);
        }
    }

    public function getByInvoice($invoiceId)
    {
        $payments = Payment::with('receivedBy')
            ->where('invoice_id', $invoiceId)
            ->orderBy('payment_date')
            ->get();

        return response()->json($payments);
    }

    public function getByPatient($patientId)
    {
        $payments = Payment::with(['invoice', 'receivedBy'])
            ->where('patient_id', $patientId)
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json($payments);
    }

    public function getDailyReport(Request $request)
    {
        $date = $request->input('date', now()->toDateString());

        $payments = Payment::with(['invoice.patient', 'receivedBy'])
            ->whereDate('payment_date', $date)
            ->get();

        $summary = [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
            'by_method' => $payments->groupBy('payment_method')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                ];
            }),
            'payments' => $payments,
        ];

        return Inertia::render('payments/daily-report', [
            'date' => $date,
            'summary' => $summary,
        ]);
    }
}
