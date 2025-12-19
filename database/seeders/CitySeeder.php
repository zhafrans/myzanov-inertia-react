<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(storage_path('app/private/cities.json')), true);

        $cities = $data['cities'];

        foreach ($cities as $city) {
            City::firstOrCreate([
                'id' => $city['id'],
                'code' => $city['code'],
                'name' => $city['name'],
                'province_id' => $city['province_id']
            ]);
        }
    }
}
