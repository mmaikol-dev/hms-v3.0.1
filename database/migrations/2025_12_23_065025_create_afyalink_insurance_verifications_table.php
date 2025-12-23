<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('afyalink_insurance_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('verification_reference')->unique();
            $table->string('id_number');
            $table->string('scheme_name')->nullable();
            $table->string('member_number')->nullable();
            $table->string('status'); // active, inactive, suspended
            $table->json('coverage_details')->nullable();
            $table->json('dependents')->nullable();
            $table->date('coverage_start_date')->nullable();
            $table->date('coverage_end_date')->nullable();
            $table->decimal('annual_limit', 15, 2)->nullable();
            $table->decimal('used_amount', 15, 2)->default(0);
            $table->decimal('available_balance', 15, 2)->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('verified_at');
            $table->timestamps();

            $table->index(['patient_id', 'verified_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('afyalink_insurance_verifications');
    }
};
