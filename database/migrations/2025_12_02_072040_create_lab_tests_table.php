<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->string('test_name');
            $table->string('test_code')->unique();
            $table->text('description')->nullable();
            $table->string('category'); // Blood, Urine, Imaging, etc
            $table->decimal('price', 10, 2);
            $table->integer('normal_duration_hours')->default(24);
            $table->text('preparation_instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lab_tests');
    }
};