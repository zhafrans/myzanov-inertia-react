<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesOutstanding extends Model
{
    protected $guarded = [];

    public function sale()
    {
        return $this->belongsTo(Sales::class);
    }
}
