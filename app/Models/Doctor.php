<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'department_id', 'specialization', 'qualification',
        'consultation_fee', 'biography', 'experience_years',
        'available_days', 'shift_start', 'shift_end'
    ];

    protected $casts = [
        'available_days' => 'array',
        'shift_start' => 'datetime',
        'shift_end' => 'datetime',
        'consultation_fee' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_id', 'user_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'doctor_id', 'user_id');
    }

    public function admissions()
    {
        return $this->hasMany(Admission::class, 'doctor_id', 'user_id');
    }
}