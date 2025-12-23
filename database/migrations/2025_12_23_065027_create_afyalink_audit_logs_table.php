<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('afyalink_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // verify, preauth, claim, etc.
            $table->string('endpoint');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('patient_id')->nullable()->constrained()->onDelete('cascade');
            $table->morphs('related'); // Can link to verification, preauth, or claim
            $table->json('request_payload')->nullable();
            $table->json('response_data')->nullable();
            $table->integer('response_status')->nullable();
            $table->text('error_message')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['action', 'created_at']);
            $table->index('patient_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('afyalink_audit_logs');
    }
};
