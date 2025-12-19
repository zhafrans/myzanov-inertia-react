<?php

namespace Database\Seeders;

use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProvinceSeeder extends Seeder
{
    public function run()
    {
        $data = json_decode(file_get_contents(storage_path('app/private/provinces.json')), true);

        $provinces = $data['provinces'];

        foreach ($provinces as $province) {
            Province::firstOrCreate([
                'id' => $province['id'],
                'code' => $province['code'],
                'name' => $province['name']
            ]);
        }
    }
}