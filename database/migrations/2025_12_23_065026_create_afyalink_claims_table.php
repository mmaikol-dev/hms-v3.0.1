<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('afyalink_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('preauthorization_id')->nullable()->constrained('afyalink_preauthorizations');
            $table->string('claim_number')->unique();
            $table->string('afyalink_claim_reference')->nullable();
            $table->string('member_number');
            $table->string('scheme_name');
            $table->text('diagnosis');
            $table->json('services')->nullable(); // Array of services provided
            $table->decimal('claimed_amount', 15, 2);
            $table->decimal('approved_amount', 15, 2)->nullable();
            $table->decimal('rejected_amount', 15, 2)->default(0);
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'partially_approved', 'rejected', 'paid'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->date('service_date');
            $table->json('attachments')->nullable(); // URLs to supporting documents
            $table->json('raw_request')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['invoice_id', 'status']);
            $table->index('claim_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('afyalink_claims');
    }
};
