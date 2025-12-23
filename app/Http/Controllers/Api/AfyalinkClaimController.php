<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AfyalinkClaim;
use App\Models\AfyalinkPreauthorization;
use App\Models\Invoice;
use App\Models\Patient;
use App\Services\AfyalinkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AfyalinkClaimController extends Controller
{
    protected $afyalink;

    public function __construct(AfyalinkService $afyalink)
    {
        $this->afyalink = $afyalink;
    }

    /**
     * Submit insurance claim
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'invoice_id' => 'required|exists:invoices,id',
            'preauthorization_id' => 'nullable|exists:afyalink_preauthorizations,id',
            'member_number' => 'required|string',
            'scheme_code' => 'required|string',
            'diagnosis' => 'required|string',
            'diagnosis_code' => 'nullable|string',
            'service_date' => 'required|date',
            'services' => 'required|array',
            'services.*.description' => 'required|string',
            'services.*.code' => 'nullable|string',
            'services.*.quantity' => 'required|numeric|min:1',
            'services.*.unit_price' => 'required|numeric|min:0',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $patient = Patient::findOrFail($request->patient_id);
        $invoice = Invoice::findOrFail($request->invoice_id);

        // Generate claim number
        $claimNumber = 'CLM-'.date('Ymd').'-'.strtoupper(Str::random(6));

        // Calculate total amount from services
        $totalAmount = collect($request->services)->sum(function ($service) {
            return $service['quantity'] * $service['unit_price'];
        });

        $data = [
            'claim_number' => $claimNumber,
            'member_number' => $request->member_number,
            'scheme_name' => $result['data']['scheme_name'] ?? null,
            'scheme_code' => $request->scheme_code,
            'patient_name' => $patient->full_name,
            'preauth_reference' => $request->preauthorization_id
                ? AfyalinkPreauthorization::find($request->preauthorization_id)?->afyalink_reference
                : null,
            'diagnosis' => $request->diagnosis,
            'diagnosis_code' => $request->diagnosis_code,
            'service_date' => $request->service_date,
            'services' => $request->services,
            'total_amount' => $totalAmount,
            'attachments' => $request->attachments ?? [],
        ];

        $result = $this->afyalink->submitClaim($data, $patient->id);

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], $result['status']);
        }

        // Store claim
        $claim = AfyalinkClaim::create([
            'patient_id' => $patient->id,
            'invoice_id' => $invoice->id,
            'preauthorization_id' => $request->preauthorization_id,
            'claim_number' => $claimNumber,
            'afyalink_claim_reference' => $result['data']['claim_reference'] ?? null,
            'member_number' => $request->member_number,
            'scheme_name' => $result['data']['scheme_name'] ?? $request->scheme_code,
            'diagnosis' => $request->diagnosis,
            'services' => $request->services,
            'claimed_amount' => $totalAmount,
            'approved_amount' => $result['data']['approved_amount'] ?? null,
            'status' => $result['data']['status'] ?? 'submitted',
            'service_date' => $request->service_date,
            'attachments' => $request->attachments,
            'raw_request' => $data,
            'raw_response' => $result['data'],
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Claim submitted successfully',
            'data' => $claim,
        ], 201);
    }

    /**
     * Check claim status
     */
    public function checkStatus($id)
    {
        $claim = AfyalinkClaim::findOrFail($id);

        if (! $claim->afyalink_claim_reference) {
            return response()->json([
                'success' => false,
                'message' => 'No AfyaLink claim reference found',
            ], 400);
        }

        $result = $this->afyalink->checkClaimStatus(
            $claim->afyalink_claim_reference,
            $claim->patient_id
        );

        if ($result['success']) {
            // Update local record
            $claim->update([
                'status' => $result['data']['status'] ?? $claim->status,
                'approved_amount' => $result['data']['approved_amount'] ?? $claim->approved_amount,
                'rejected_amount' => $result['data']['rejected_amount'] ?? 0,
                'rejection_reason' => $result['data']['rejection_reason'] ?? null,
                'approved_at' => isset($result['data']['approved_at']) ? $result['data']['approved_at'] : $claim->approved_at,
                'paid_at' => $result['data']['status'] === 'paid' && ! $claim->paid_at ? now() : $claim->paid_at,
            ]);
        }

        return response()->json([
            'success' => $result['success'],
            'data' => $claim->fresh(),
        ]);
    }

    /**
     * Get all claims
     */
    public function index(Request $request)
    {
        $query = AfyalinkClaim::with(['patient', 'invoice', 'preauthorization']);

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('invoice_id')) {
            $query->where('invoice_id', $request->invoice_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('service_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('service_date', '<=', $request->date_to);
        }

        $claims = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $claims,
        ]);
    }

    /**
     * Get single claim
     */
    public function show($id)
    {
        $claim = AfyalinkClaim::with(['patient', 'invoice', 'preauthorization'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $claim,
        ]);
    }

    /**
     * Upload document for claim
     */
    public function uploadDocument(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'document_type' => 'required|string|in:prescription,lab_results,medical_report,invoice,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $claim = AfyalinkClaim::findOrFail($id);

        $result = $this->afyalink->uploadDocument(
            $request->file('file'),
            $request->document_type,
            $claim->afyalink_claim_reference
        );

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], 400);
        }

        // Update claim attachments
        $attachments = $claim->attachments ?? [];
        $attachments[] = [
            'type' => $request->document_type,
            'url' => $result['data']['document_url'] ?? null,
            'uploaded_at' => now()->toISOString(),
        ];

        $claim->update(['attachments' => $attachments]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $result['data'],
        ]);
    }

    /**
     * Get claims statistics/dashboard
     */
    public function statistics(Request $request)
    {
        $query = AfyalinkClaim::query();

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $stats = [
            'total_claims' => $query->count(),
            'total_claimed' => $query->sum('claimed_amount'),
            'total_approved' => $query->sum('approved_amount'),
            'total_rejected' => $query->sum('rejected_amount'),
            'by_status' => $query->selectRaw('status, COUNT(*) as count, SUM(claimed_amount) as total')
                ->groupBy('status')
                ->get(),
            'pending_claims' => $query->where('status', 'submitted')->count(),
            'approved_claims' => $query->where('status', 'approved')->count(),
            'rejected_claims' => $query->where('status', 'rejected')->count(),
            'paid_claims' => $query->where('status', 'paid')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
