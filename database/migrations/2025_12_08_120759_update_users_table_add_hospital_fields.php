<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'admin',
                'doctor',
                'nurse',
                'receptionist',
                'pharmacist',
                'lab_technician',
                'accountant',
            ])->default('receptionist')->after('password');

            $table->foreignId('department_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete()
                ->after('role');

            $table->string('license_number')->nullable()->after('department_id');
            $table->text('address')->nullable()->after('license_number');
            $table->date('date_of_birth')->nullable()->after('address');

            $table->enum('gender', ['male', 'female', 'other'])
                ->nullable()
                ->after('date_of_birth');

            $table->string('avatar')->nullable()->after('gender');
            $table->boolean('is_active')->default(true)->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'department_id',
                'license_number',
                'address',
                'date_of_birth',
                'gender',
                'avatar',
                'is_active',
            ]);
        });
    }
};
