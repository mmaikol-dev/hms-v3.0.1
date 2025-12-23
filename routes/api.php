<?php

use App\Http\Controllers\Api\AfyalinkClaimController;
use App\Http\Controllers\Api\AfyalinkInsuranceController;
use App\Http\Controllers\Api\AfyalinkPreauthorizationController;

// Insurance Verification Routes
Route::middleware('api')->group(function () {
    Route::prefix('afyalink/insurance')->group(function () {
        Route::post('/verify', [AfyalinkInsuranceController::class, 'verify']);
        Route::get('/schemes', [AfyalinkInsuranceController::class, 'getSchemes']);
        Route::get('/patient/{patientId}/history', [AfyalinkInsuranceController::class, 'getVerificationHistory']);
        Route::get('/patient/{patientId}/latest', [AfyalinkInsuranceController::class, 'getLatestVerification']);
    });
});

// Pre-authorization Routes
Route::prefix('afyalink/preauthorizations')->group(function () {
    Route::get('/', [AfyalinkPreauthorizationController::class, 'index']);
    Route::post('/', [AfyalinkPreauthorizationController::class, 'submit']);
    Route::get('/{id}', [AfyalinkPreauthorizationController::class, 'show']);
    Route::post('/{id}/check-status', [AfyalinkPreauthorizationController::class, 'checkStatus']);
});

// Claims Routes
Route::prefix('afyalink/claims')->group(function () {
    Route::get('/', [AfyalinkClaimController::class, 'index']);
    Route::post('/', [AfyalinkClaimController::class, 'submit']);
    Route::get('/statistics', [AfyalinkClaimController::class, 'statistics']);
    Route::get('/{id}', [AfyalinkClaimController::class, 'show']);
    Route::post('/{id}/check-status', [AfyalinkClaimController::class, 'checkStatus']);
    Route::post('/{id}/upload-document', [AfyalinkClaimController::class, 'uploadDocument']);
});
