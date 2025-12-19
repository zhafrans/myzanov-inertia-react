<?php

namespace Database\Seeders;

use App\Models\Village;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VillageSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(storage_path('app/private/villages.json')), true);

        $villages = $data['villages'];

        foreach ($villages as $village) {
            Village::firstOrCreate([
                'id' => $village['id'],
                'code' => $village['code'],
                'name' => $village['name'],
                'subdistrict_id' => $village['subdistrict_id']
            ]);
        }
    }
}
