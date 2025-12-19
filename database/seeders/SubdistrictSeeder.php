<?php

namespace Database\Seeders;

use App\Models\Subdistrict;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubdistrictSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(storage_path('app/private/subdistricts.json')), true);

        $subdistricts = $data['subdistricts'];

        foreach ($subdistricts as $subdistrict) {
            Subdistrict::firstOrCreate([
                'id' => $subdistrict['id'],
                'code' => $subdistrict['code'],
                'name' => $subdistrict['name'],
                'city_id' => $subdistrict['city_id']
            ]);
        }
    }
}
