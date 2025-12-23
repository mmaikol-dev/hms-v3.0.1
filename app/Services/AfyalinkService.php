<?php

namespace App\Services;

use App\Models\AfyalinkAuditLog;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AfyalinkService
{
    protected string $baseUrl;

    protected string $apiKey;

    protected string $apiSecret;

    protected string $facilityCode;

    protected int $timeout = 30;

    protected bool $mock = false;

    public function __construct()
    {
        // DHA UAT setup
        $this->baseUrl = 'https://uat.dha.go.ke';  // Base URL
        $this->apiKey = 'QW3-DHABP05046';          // Key from credentials
        $this->apiSecret = 'zV5NocXJpDEIdc3T7pXX02FYpPz0jwpzdATz171SEw3PJMGu'; // Secret
        $this->facilityCode = 'DHABP05046';        // Facility code
        $this->mock = config('services.afyalink.mock', false);
    }

    /**
     * Verify patient insurance eligibility
     */
    public function verifyInsurance($nationalId, $schemeCode = null, $patientId = null)
    {
        if ($this->mock) {
            return [
                'success' => true,
                'status' => 200,
                'data' => [
                    'verification_status' => 'ACTIVE',
                    'member_number' => 'NHIF-MOCK-'.substr($nationalId, -4),
                    'scheme_code' => $schemeCode,
                    'facility_code' => $this->facilityCode,
                    'patient_id' => $patientId,
                ],
            ];
        }

        // Payload for DHA UAT validate endpoint
        $payload = [
            'id_number' => $nationalId,
            'scheme_code' => $schemeCode,
            'facility_code' => $this->facilityCode,
        ];

        return $this->makeRequest('post', '/api/v1/eligibility/verify', $payload, $patientId, 'verify_insurance');
    }

    /**
     * Make authenticated request to DHA UAT
     */
    protected function makeRequest($method, $endpoint, $data = [], $patientId = null, $action = null)
    {
        try {
            $startTime = microtime(true);

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'X-API-Key' => $this->apiKey,
                    'X-API-Secret' => $this->apiSecret,
                    'Accept' => 'application/json',
                ])
                ->$method("{$this->baseUrl}{$endpoint}", $data);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            $this->auditLog([
                'action' => $action ?? "{$method} {$endpoint}",
                'endpoint' => $endpoint,
                'patient_id' => $patientId,
                'request_payload' => $data,
                'response_data' => $response->json(),
                'response_status' => $response->status(),
                'response_time' => $responseTime,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'status' => $response->status(),
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'status' => $response->status(),
                'error' => $response->json()['error_msg'] ?? 'Request failed',
                'data' => $response->json(),
            ];

        } catch (Exception $e) {
            Log::error('DHA UAT API error: '.$e->getMessage(), [
                'endpoint' => $endpoint,
                'data' => $data,
            ]);

            $this->auditLog([
                'action' => $action ?? "{$method} {$endpoint}",
                'endpoint' => $endpoint,
                'patient_id' => $patientId,
                'request_payload' => $data,
                'response_status' => 500,
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'status' => 500,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Audit logging
     */
    protected function auditLog($data)
    {
        try {
            AfyalinkAuditLog::create([
                'action' => $data['action'],
                'endpoint' => $data['endpoint'],
                'user_id' => auth()->id(),
                'patient_id' => $data['patient_id'] ?? null,
                'request_payload' => $data['request_payload'] ?? null,
                'response_data' => $data['response_data'] ?? null,
                'response_status' => $data['response_status'],
                'error_message' => $data['error_message'] ?? null,
                'ip_address' => request()->ip(),
            ]);
        } catch (Exception $e) {
            Log::error('DHA UAT audit log failure: '.$e->getMessage());
        }
    }
}
