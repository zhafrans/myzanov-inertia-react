<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')
            ->latest();

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by module
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        // Filter by device
        if ($request->filled('device')) {
            $device = $request->device;
            if ($device === 'mobile') {
                $query->where(function ($q) {
                    $q->where('user_agent', 'like', '%Mobile%')
                        ->orWhere(function ($subQ) {
                            $subQ->where('user_agent', 'like', '%Android%')
                                ->where('user_agent', 'like', '%Mobile%');
                        })
                        ->orWhere('user_agent', 'like', '%iPhone%')
                        ->orWhere('user_agent', 'like', '%Windows Phone%');
                });
            } elseif ($device === 'desktop') {
                $query->where(function ($q) {
                    $q->where(function ($subQ) {
                        $subQ->where('user_agent', 'like', '%Windows%')
                            ->orWhere('user_agent', 'like', '%Macintosh%')
                            ->orWhere('user_agent', 'like', '%Linux%')
                            ->orWhere('user_agent', 'like', '%X11%');
                    })
                    ->where(function ($subQ) {
                        $subQ->where('user_agent', 'not like', '%Mobile%')
                            ->where('user_agent', 'not like', '%iPhone%')
                            ->where('user_agent', 'not like', '%iPad%')
                            ->where('user_agent', 'not like', '%Windows Phone%');
                    });
                });
            } elseif ($device === 'tablet') {
                $query->where(function ($q) {
                    $q->where('user_agent', 'like', '%iPad%')
                        ->orWhere(function ($subQ) {
                            $subQ->where('user_agent', 'like', '%Android%')
                                ->where('user_agent', 'not like', '%Mobile%');
                        });
                });
            } else {
                // Filter by specific device name (search in user_agent)
                $query->where('user_agent', 'like', '%' . $device . '%');
            }
        }

        // Filter by search (description)
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate(20);

        // Get filter options
        $users = User::orderBy('name')->get(['id', 'name']);
        $actions = ActivityLog::distinct()->pluck('action');
        $modules = ActivityLog::distinct()->pluck('module');
        
        // Get distinct devices from user_agent
        $devices = $this->getDistinctDevices();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'user_id', 'action', 'module', 'device', 'start_date', 'end_date']),
            'filterOptions' => [
                'users' => $users,
                'actions' => $actions,
                'modules' => $modules,
                'devices' => $devices,
            ]
        ]);
    }

    /**
     * Get distinct devices from activity logs
     */
    private function getDistinctDevices()
    {
        // Get device types that exist in the logs
        $deviceTypes = ['mobile', 'desktop', 'tablet'];
        $availableTypes = [];

        // Check which device types have data
        foreach ($deviceTypes as $type) {
            $count = ActivityLog::whereNotNull('user_agent')
                ->where(function ($q) use ($type) {
                    if ($type === 'mobile') {
                        $q->where('user_agent', 'like', '%Mobile%')
                            ->orWhere(function ($subQ) {
                                $subQ->where('user_agent', 'like', '%Android%')
                                    ->where('user_agent', 'like', '%Mobile%');
                            })
                            ->orWhere('user_agent', 'like', '%iPhone%')
                            ->orWhere('user_agent', 'like', '%Windows Phone%');
                    } elseif ($type === 'desktop') {
                        $q->where(function ($subQ) {
                            $subQ->where('user_agent', 'like', '%Windows%')
                                ->orWhere('user_agent', 'like', '%Macintosh%')
                                ->orWhere('user_agent', 'like', '%Linux%')
                                ->orWhere('user_agent', 'like', '%X11%');
                        })
                        ->where(function ($subQ) {
                            $subQ->where('user_agent', 'not like', '%Mobile%')
                                ->where('user_agent', 'not like', '%iPhone%')
                                ->where('user_agent', 'not like', '%iPad%')
                                ->where('user_agent', 'not like', '%Windows Phone%');
                        });
                    } elseif ($type === 'tablet') {
                        $q->where('user_agent', 'like', '%iPad%')
                            ->orWhere(function ($subQ) {
                                $subQ->where('user_agent', 'like', '%Android%')
                                    ->where('user_agent', 'not like', '%Mobile%');
                            });
                    }
                })
                ->count();

            if ($count > 0) {
                $availableTypes[] = [
                    'value' => $type,
                    'label' => ucfirst($type),
                    'count' => $count,
                ];
            }
        }

        return $availableTypes;
    }

}
