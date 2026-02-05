<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id', 'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'gender', 'blood_group', 'address', 'city',
        'state', 'zip_code', 'emergency_contact_name', 'emergency_contact_phone',
        'emergency_contact_relation', 'medical_history', 'allergies',
        'insurance_provider', 'insurance_policy_number', 'is_active',
        'file_no','member_no','national_id'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
    ];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function labTestRequests()
    {
        return $this->hasMany(LabTestRequest::class);
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function insuranceVerifications()
    {
        return $this->hasMany(AfyalinkInsuranceVerification::class);
    }

    public function preauthorizations()
    {
        return $this->hasMany(AfyalinkPreauthorization::class);
    }

    public function claims()
    {
        return $this->hasMany(AfyalinkClaim::class);
    }

    public function ambulanceTrips()
    {
        return $this->hasMany(AmbulanceTrip::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
