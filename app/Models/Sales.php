<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(SalesItem::class, 'sale_id');
    }

    public function installments()
    {
        return $this->hasMany(SalesInstallment::class, 'sale_id');
    }

    public function outstanding()
    {
        return $this->hasOne(SalesOutstanding::class, 'sale_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function province()
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function subdistrict()
    {
        return $this->belongsTo(Subdistrict::class, 'subdistrict_id');
    }

    public function village()
    {
        return $this->belongsTo(Village::class, 'village_id');
    }

    public function paymentTypeChanges()
    {
        return $this->hasMany(PaymentTypeChange::class, 'sale_id');
    }
}
