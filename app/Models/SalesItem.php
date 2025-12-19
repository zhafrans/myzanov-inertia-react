<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesItem extends Model
{
    protected $guarded = [];

    public function sale()
    {
        return $this->belongsTo(Sales::class);
    }
}
