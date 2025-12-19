<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesInstallment extends Model
{
    protected $guarded = [];

    public function sale()
    {
        return $this->belongsTo(Sales::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collector_id');
    }
}
