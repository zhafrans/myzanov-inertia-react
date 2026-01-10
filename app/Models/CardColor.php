<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\CardColor as CardColorEnum;

class CardColor extends Model
{
    protected $fillable = [
        'color_name',
        'sales_id',
    ];

    protected $casts = [
        'color_name' => 'string',
    ];

    public function sales()
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function getHexColorAttribute()
    {
        $colorEnum = constant('App\Enums\CardColor::' . $this->color_name);
        return $colorEnum?->value;
    }

    public function getDisplayNameAttribute()
    {
        try {
            $colorEnum = constant('App\Enums\CardColor::' . $this->color_name);
            return $colorEnum?->getName() ?? $this->color_name;
        } catch (\Throwable $e) {
            return $this->color_name;
        }
    }

    public static function getAvailableColors()
    {
        return collect(CardColorEnum::cases())->map(function ($color) {
            return [
                'name' => $color->name,
                'value' => $color->value,
                'display_name' => $color->getName(),
            ];
        });
    }
}
