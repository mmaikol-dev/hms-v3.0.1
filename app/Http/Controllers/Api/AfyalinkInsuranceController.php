<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AfyalinkInsuranceController extends Controller
{
    protected string $baseUrl;

    protected string $apiKey;

    protected string $apiSecret;

    protected string $facilityCode;

    protected int $timeout = 30;

    public function __construct()
    {
        // UAT / DHA credentials (hard-coded or from .env)
        $this->baseUrl = 'https://uat.dha.go.ke';
        $this->apiKey = 'QW3-DHABP05046';
        $this->apiSecret = 'zV5NocXJpDEIdc3T7pXX02FYpPz0jwpzdATz171SEw3PJMGu';
        $this->facilityCode = 'DHABP05046';
    }

    /**
     * Verify patient insurance
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'national_id' => 'required|string',
            'scheme_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $payload = [
            'id_number' => $request->national_id,
            'scheme_code' => $request->scheme_code,
            'facility_code' => $this->facilityCode,
        ];

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'X-API-Secret' => $this->apiSecret,
                    'Accept' => 'application/json',
                ])
                ->post("{$this->baseUrl}/api/v1/eligibility/verify", $payload);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json(),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $response->json()['error_msg'] ?? 'Insurance verification failed',
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'API request failed: '.$e->getMessage(),
            ], 500);
        }
    }
}
