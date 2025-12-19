<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Enums\UserRole;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // SuperAdmin
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'role' => UserRole::SuperAdmin->value,
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        // Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => UserRole::Admin->value,
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        // 4 Sales
        for ($i = 1; $i <= 4; $i++) {
            User::create([
                'name' => "Sales $i",
                'email' => "sales$i@example.com",
                'role' => UserRole::Sales->value,
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]);
        }

        // 4 Drivers
        for ($i = 1; $i <= 4; $i++) {
            User::create([
                'name' => "Driver $i",
                'email' => "driver$i@example.com",
                'role' => UserRole::Driver->value,
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]);
        }

        // 2 Collectors
        for ($i = 1; $i <= 2; $i++) {
            User::create([
                'name' => "Collector $i",
                'email' => "collector$i@example.com",
                'role' => UserRole::Collector->value,
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]);
        }
    }
}
