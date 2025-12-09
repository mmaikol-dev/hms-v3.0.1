<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name', 'item_code', 'category', 'description',
        'unit_of_measure', 'quantity_in_stock', 'reorder_level',
        'unit_cost', 'supplier', 'last_purchase_date', 'is_active'
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'last_purchase_date' => 'date',
        'is_active' => 'boolean',
    ];
}