<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    protected $guarded = [];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    protected $hidden = [
        'password', // Pastikan password tidak ikut terserialisasi
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->morphTo(null, 'model_type', 'model_id');
    }

    // Accessor untuk memastikan password tidak ditampilkan
    protected function getNewValuesAttribute($value)
    {
        $data = json_decode($value, true);

        if (is_array($data)) {
            // Mask password jika ada di new_values
            if (isset($data['password'])) {
                $data['password'] = '******';
            }
        }

        return $data;
    }

    protected function getOldValuesAttribute($value)
    {
        $data = json_decode($value, true);

        if (is_array($data)) {
            // Mask password jika ada di old_values
            if (isset($data['password'])) {
                $data['password'] = '******';
            }
        }

        return $data;
    }
}
