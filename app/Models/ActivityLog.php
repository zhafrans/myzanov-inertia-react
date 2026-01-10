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

    // Mutator untuk memastikan password tidak disimpan
    public function setNewValuesAttribute($value)
    {
        $data = $value;
        
        if (is_array($data) && isset($data['password'])) {
            $data['password'] = '******';
        }
        
        $this->attributes['new_values'] = json_encode($data);
    }

    public function setOldValuesAttribute($value)
    {
        $data = $value;
        
        if (is_array($data) && isset($data['password'])) {
            $data['password'] = '******';
        }
        
        $this->attributes['old_values'] = json_encode($data);
    }
}
