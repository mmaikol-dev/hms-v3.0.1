<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LabTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_name', 'test_code', 'description', 'category', 'price',
        'normal_duration_hours', 'preparation_instructions', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function requests()
    {
        return $this->hasMany(LabTestRequest::class);
    }
}