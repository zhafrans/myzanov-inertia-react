<?php

declare(strict_types=1);

namespace App\Enums;

enum CardColor: string
{
    case Yellow = '#F7E381';
    case Pink = '#F4ABB7';
    case Orange = '#F2935D';
    case Blue = '#A7D5E0';

    public function getName(): string
    {
        return str()->headline($this->name);
    }
}
