<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaSchedule extends Model
{
    protected $fillable = [
        'daily_at',
        'weekly_day', 
        'weekly_at',
        'type'
    ];

    protected $casts = [
        'daily_at' => 'datetime:H:i:s',
        'weekly_at' => 'datetime:H:i:s',
    ];
}
