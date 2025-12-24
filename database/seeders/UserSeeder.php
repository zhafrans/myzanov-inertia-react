<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Enums\UserRole;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ================= SUPER ADMIN =================
        $superAdmins = ['afan', 'opang', 'imam', 'siti'];

        foreach ($superAdmins as $name) {
            User::create([
                'name' => ucfirst($name),
                'email' => "{$name}@zanov.co.id",
                'address' => "Jl. Dummy {$name}",
                'phone' => "0800" . rand(1000000, 9999999),
                'role' => UserRole::SuperAdmin->value,
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // ================= ADMIN =================
        User::create([
            'name' => 'Afif',
            'email' => 'afif@zanov.co.id',
            'address' => "Jl. Dummy Afif",
            'phone' => "0800" . rand(1000000, 9999999),
            'role' => UserRole::Admin->value,
            'password' => Hash::make('password'),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // ================= SALES =================
        $sales = ['umi', 'ati', 'into', 'nisya', 'resti', 'sri', 'ika', 'winda'];
        $inactiveSales = ['ati', 'into', 'resti', 'winda'];

        foreach ($sales as $name) {
            User::create([
                'name' => ucfirst($name),
                'email' => "{$name}@zanov.co.id",
                'address' => "Jl. Dummy {$name}",
                'phone' => "0800" . rand(1000000, 9999999),
                'role' => UserRole::Sales->value,
                'password' => Hash::make('password'),
                'is_active' => !in_array($name, $inactiveSales),
                'email_verified_at' => now(),
            ]);
        }

        // ================= DRIVER =================
        $drivers = ['dilham', 'arif', 'iris', 'behi', 'bihan', 'rian'];
        $inactiveDrivers = ['arif', 'iris'];

        foreach ($drivers as $name) {
            User::create([
                'name' => ucfirst($name),
                'email' => "{$name}@zanov.co.id",
                'address' => "Jl. Dummy {$name}",
                'phone' => "0800" . rand(1000000, 9999999),
                'role' => UserRole::Driver->value,
                'password' => Hash::make('password'),
                'is_active' => !in_array($name, $inactiveDrivers),
                'email_verified_at' => now(),
            ]);
        }

        // ================= COLLECTOR =================
        $collectors = ['lukman', 'toni'];

        foreach ($collectors as $name) {
            User::create([
                'name' => ucfirst($name),
                'email' => "{$name}@zanov.co.id",
                'address' => "Jl. Dummy {$name}",
                'phone' => "0800" . rand(1000000, 9999999),
                'role' => UserRole::Collector->value,
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
