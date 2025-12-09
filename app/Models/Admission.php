<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Admission extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_number', 'patient_id', 'doctor_id', 'bed_id',
        'admission_date', 'discharge_date', 'admission_reason',
        'diagnosis', 'treatment_plan', 'discharge_summary', 'status'
    ];

    protected $casts = [
        'admission_date' => 'datetime',
        'discharge_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function bed()
    {
        return $this->belongsTo(Bed::class);
    }
}
