<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmbulanceTrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_number', 'ambulance_id', 'patient_id', 'driver_id',
        'pickup_location', 'dropoff_location', 'pickup_time',
        'dropoff_time', 'distance_km', 'charge', 'status', 'notes'
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
        'dropoff_time' => 'datetime',
        'distance_km' => 'decimal:2',
        'charge' => 'decimal:2',
    ];

    public function ambulance()
    {
        return $this->belongsTo(Ambulance::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}

