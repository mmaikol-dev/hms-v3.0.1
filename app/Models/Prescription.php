<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_number', 'patient_id', 'doctor_id', 'appointment_id',
        'prescription_date', 'diagnosis', 'notes', 'status'
    ];

    protected $casts = [
        'prescription_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

   public function doctor()
{
    return $this->belongsTo(Doctor::class, 'doctor_id');
}


    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}