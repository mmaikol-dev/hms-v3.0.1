<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('afyalink_preauthorizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->string('preauth_number')->unique();
            $table->string('afyalink_reference')->nullable();
            $table->string('member_number');
            $table->string('scheme_name');
            $table->text('diagnosis');
            $table->text('procedure_description');
            $table->json('procedure_codes')->nullable(); // ICD-10, CPT codes
            $table->decimal('requested_amount', 15, 2);
            $table->decimal('approved_amount', 15, 2)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->date('service_date');
            $table->date('approval_expiry_date')->nullable();
            $table->string('approved_by')->nullable();
            $table->json('raw_request')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index('preauth_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('afyalink_preauthorizations');
    }
};
