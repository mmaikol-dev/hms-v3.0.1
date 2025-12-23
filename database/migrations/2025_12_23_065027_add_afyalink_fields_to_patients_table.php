<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('national_id')->nullable()->after('patient_id');
            $table->string('nhif_number')->nullable()->after('insurance_policy_number');
            $table->string('sha_number')->nullable()->after('nhif_number'); // Social Health Authority
            $table->boolean('insurance_verified')->default(false)->after('sha_number');
            $table->timestamp('last_insurance_verification')->nullable()->after('insurance_verified');
        });
    }

    public function down()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['national_id', 'nhif_number', 'sha_number', 'insurance_verified', 'last_insurance_verification']);
        });
    }
};
