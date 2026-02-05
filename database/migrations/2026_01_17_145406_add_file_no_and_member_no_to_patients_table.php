<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
           
            // If you want them to be unique, uncomment these instead:
            $table->string('file_no')->unique()->nullable()->after('id');
            $table->string('member_no')->unique()->nullable()->after('file_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['file_no', 'member_no']);
        });
    }
};