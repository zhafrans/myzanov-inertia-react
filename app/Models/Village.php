<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Village extends Model
{
    public function subdistrict()
    {
        return $this->belongsTo(Subdistrict::class);
    }
}
