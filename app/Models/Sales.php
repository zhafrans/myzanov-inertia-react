<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(SalesItem::class);
    }

    public function installments()
    {
        return $this->hasMany(SalesInstallment::class);
    }

    public function outstandings()
    {
        return $this->hasMany(SalesOutstanding::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
