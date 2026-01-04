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

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'model_type' => WaSchedule::class,
            'model_id' => $waSchedule->id,
            'old_values' => $oldValues,
            'new_values' => $validated,
            'description' => 'Updated WhatsApp schedule',
        ]);

        return back()->with('success', 'Jadwal WhatsApp berhasil diperbarui');
    }
}
