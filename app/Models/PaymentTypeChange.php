<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTypeChange extends Model
{
    protected $fillable = [
        'sale_id',
        'from_payment_type',
        'to_payment_type',
        'reason',
        'changed_by',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sales::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
