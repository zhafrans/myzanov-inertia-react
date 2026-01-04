<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WaSchedule;

class WaScheduleSeeder extends Seeder
{
    public function run(): void
    {
        // Create daily schedule (default 08:00)
        WaSchedule::updateOrCreate(
            ['type' => 'daily'],
            [
                'daily_at' => '08:00:00',
                'weekly_day' => null,
                'weekly_at' => null,
            ]
        );

        // Create weekly schedule (default Monday at 08:00)
        WaSchedule::updateOrCreate(
            ['type' => 'weekly'],
            [
                'daily_at' => null,
                'weekly_day' => 1, // Monday (Carbon format: 0=Sunday, 1=Monday, ..., 6=Saturday)
                'weekly_at' => '08:00:00',
            ]
        );
    }
}
