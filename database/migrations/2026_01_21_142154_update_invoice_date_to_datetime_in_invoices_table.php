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
        Schema::table('invoices', function (Blueprint $table) {
            // Change invoice_date from date to datetime
            $table->dateTime('invoice_date')->change();
        });
        
        // If you also want to update due_date to datetime
        Schema::table('invoices', function (Blueprint $table) {
            $table->dateTime('due_date')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Revert back to date
            $table->date('invoice_date')->change();
            $table->date('due_date')->change();
        });
    }
};