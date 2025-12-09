<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LabTestRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number', 'patient_id', 'doctor_id', 'lab_test_id',
        'assigned_to', 'requested_date', 'sample_collected_at',
        'result_date', 'status', 'result', 'report_file', 'notes'
    ];

    protected $casts = [
        'requested_date' => 'datetime',
        'sample_collected_at' => 'datetime',
        'result_date' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function labTest()
    {
        return $this->belongsTo(LabTest::class);
    }

    public function assignedTechnician()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
