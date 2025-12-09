<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ambulance_trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_number')->unique();
            $table->foreignId('ambulance_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete();
            $table->text('pickup_location');
            $table->text('dropoff_location');
            $table->dateTime('pickup_time');
            $table->dateTime('dropoff_time')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('charge', 10, 2)->default(0);
            $table->enum('status', ['scheduled', 'in_transit', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ambulance_trips');
    }
};
