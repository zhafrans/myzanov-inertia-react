<?php

namespace App\Http\Controllers;

use App\Models\WaSchedule;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WaScheduleController extends Controller
{
    public function index(Request $request)
    {
        $schedules = WaSchedule::orderBy('type')->get();

        return Inertia::render('WaSchedules/Index', [
            'schedules' => $schedules,
        ]);
    }

    public function update(Request $request, WaSchedule $waSchedule)
    {
        $validated = $request->validate([
            'daily_at' => 'nullable|date_format:H:i',
            'weekly_day' => 'nullable|integer|between:0,6',
            'weekly_at' => 'nullable|date_format:H:i',
            'type' => 'required|in:daily,weekly',
        ]);

        $oldValues = $waSchedule->getOriginal();
        
        $waSchedule->update($validated);

        // Filter field yang tidak perlu di-log
        $ignoredFields = ['created_at', 'updated_at'];

        // Hapus field yang diabaikan dari old dan new values
        foreach ($ignoredFields as $field) {
            unset($oldValues[$field]);
            unset($validated[$field]);
        }

        // Cari field yang berubah
        $changedFields = [];
        foreach ($validated as $key => $value) {
            if (!isset($oldValues[$key]) || $oldValues[$key] != $value) {
                $changedFields[$key] = $value;
            }
        }

        // Log activity
        if (!empty($changedFields)) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'wa_schedules',
                'description' => "Mengupdate jadwal WhatsApp: {$waSchedule->type}",
                'model_id' => $waSchedule->id,
                'model_type' => WaSchedule::class,
                'old_values' => array_intersect_key($oldValues, $changedFields),
                'new_values' => $changedFields,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } else {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'wa_schedules',
                'description' => "Mencoba mengupdate jadwal WhatsApp: {$waSchedule->type} (tidak ada perubahan)",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return back()->with('success', 'Jadwal WhatsApp berhasil diperbarui');
    }
}
