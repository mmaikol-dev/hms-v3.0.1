<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ambulance extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_number', 'vehicle_model', 'year_of_manufacture', 'driver_id',
        'vehicle_type', 'status', 'insurance_expiry', 'last_maintenance_date',
        'charge_per_km'
    ];

    protected $casts = [
        'insurance_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'charge_per_km' => 'decimal:2',
    ];

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function trips()
    {
        return $this->hasMany(AmbulanceTrip::class);
    }
}