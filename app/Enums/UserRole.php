<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'SUPER_ADMIN';
    case Admin = 'ADMIN';
    case Sales = 'SALES';
    case Driver = 'DRIVER';
    case Collector = 'COLLECTOR';

    public function getName(): string
    {
        return str()->headline($this->name);
    }
}
