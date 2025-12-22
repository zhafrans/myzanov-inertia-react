<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Sales;
use App\Models\SalesItem;
use App\Models\SalesOutstanding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role jika ada
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status aktif jika ada
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_active']),
            'sort' => ['field' => $sortField, 'direction' => $sortDirection]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,sales,collector,user',
            'is_active' => 'boolean'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'create',
            'module' => 'users',
            'description' => "Membuat user baru: {$user->name} ({$user->email})",
            'model_id' => $user->id,
            'model_type' => User::class,
            'new_values' => $user->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,sales,collector,user',
            'is_active' => 'boolean',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()]
        ]);

        $oldValues = $user->toArray();

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $newValues = $user->fresh()->toArray();

        // Filter field yang tidak perlu di-log
        $ignoredFields = ['email_verified_at', 'updated_at'];

        // Hapus field yang diabaikan dari old dan new values
        foreach ($ignoredFields as $field) {
            unset($oldValues[$field]);
            unset($newValues[$field]);
        }

        // Cari field yang berubah (setelah filter)
        $changedFields = [];
        foreach ($newValues as $key => $value) {
            if (!isset($oldValues[$key]) || $oldValues[$key] != $value) {
                $changedFields[$key] = $value;
            }
        }

        // Jika password diupdate, mask dalam log
        if (!empty($validated['password'])) {
            $changedFields['password'] = '******';
        }

        // Buat log jika ada perubahan (setelah filter)
        if (!empty($changedFields)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'module' => 'users',
                'description' => "Mengupdate user: {$user->name}",
                'model_id' => $user->id,
                'model_type' => User::class,
                'old_values' => array_intersect_key($oldValues, $changedFields),
                'new_values' => $changedFields,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } else {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'module' => 'users',
                'description' => "Mencoba mengupdate user: {$user->name} (tidak ada perubahan)",
                'model_id' => $user->id,
                'model_type' => User::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return redirect()->route('users.index')
            ->with('success', 'User berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'delete',
                'module' => 'users',
                'description' => "Mencoba menghapus akun sendiri: {$user->name} (diblokir)",
                'model_id' => $user->id,
                'model_type' => User::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return back()->with('error', 'Tidak dapat menghapus akun sendiri');
        }

        $oldValues = $user->toArray();

        $user->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'delete',
            'module' => 'users',
            'description' => "Menghapus user: {$oldValues['name']} ({$oldValues['email']})",
            'model_id' => $oldValues['id'],
            'model_type' => User::class,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil dihapus');
    }

    public function show(Request $request, User $user)
    {
        // Get date range filter (default: bulan ini)
        $allTime = $request->boolean('all_time');
        
        if ($allTime) {
            $startDate = null;
            $endDate = null;
        } else {
            // Default: bulan ini
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            
            // Jika tidak ada input, gunakan bulan ini
            if (!$startDate || !$endDate) {
                $now = now();
                $startDate = $now->copy()->startOfMonth()->format('Y-m-d');
                $endDate = $now->copy()->endOfMonth()->format('Y-m-d');
            }
        }

        // Base query for sales by this seller
        $salesQuery = Sales::where('seller_id', $user->id);

        if (!$allTime && $startDate && $endDate) {
            $salesQuery->whereBetween('transaction_at', [$startDate, $endDate]);
        }

        $salesIds = $salesQuery->pluck('id');

        // If no sales found, return empty performance data
        if ($salesIds->isEmpty()) {
            return Inertia::render('Users/Show', [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'created_at' => $user->created_at?->format('Y-m-d'),
                ],
                'performance' => [
                    'totalProduct' => 0,
                    'lunas' => [
                        'count' => 0,
                        'amount' => 0,
                    ],
                    'belumLunas' => [
                        'count' => 0,
                        'amount' => 0,
                    ],
                    'topProducts' => [],
                    'topSizes' => [],
                    'topCities' => [],
                    'topSubdistricts' => [],
                ],
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]
            ]);
        }

        // Calculate total products sold (sum of quantity from sales_items)
        $totalProducts = SalesItem::whereIn('sale_id', $salesIds)
            ->sum('quantity');

        // Calculate lunas (paid) and belum lunas (unpaid) statistics
        $lunasSales = Sales::whereIn('id', $salesIds)
            ->whereHas('outstanding', function ($query) {
                $query->where('outstanding_amount', '<=', 0);
            })
            ->get();

        $belumLunasSales = Sales::whereIn('id', $salesIds)
            ->whereHas('outstanding', function ($query) {
                $query->where('outstanding_amount', '>', 0);
            })
            ->get();

        $lunasCount = $lunasSales->count();
        $lunasAmount = $lunasSales->sum('price');

        $belumLunasCount = $belumLunasSales->count();
        $belumLunasAmount = $belumLunasSales->sum('price');

        // Get limit parameters (default 5)
        $topProductLimit = (int) $request->input('top_product_limit', 5);
        $topSizeLimit = (int) $request->input('top_size_limit', 5);
        $topCityLimit = (int) $request->input('top_city_limit', 5);
        $topSubdistrictLimit = (int) $request->input('top_subdistrict_limit', 5);

        // Get top products
        $topProducts = SalesItem::select(
            'sales_items.product_name as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->whereIn('sale_id', $salesIds)
            ->groupBy('sales_items.product_name')
            ->orderByDesc('total')
            ->limit($topProductLimit)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->name,
                    'value' => (int) $item->total
                ];
            })
            ->toArray();

        // Get top sizes
        $topSizes = SalesItem::select(
            'sales_items.size as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->whereIn('sale_id', $salesIds)
            ->whereNotNull('sales_items.size')
            ->where('sales_items.size', '!=', '')
            ->groupBy('sales_items.size')
            ->orderByDesc('total')
            ->limit($topSizeLimit)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->name,
                    'value' => (int) $item->total
                ];
            })
            ->toArray();

        // Get top cities
        $topCities = Sales::select(
            'cities.name',
            DB::raw('COUNT(sales.id) as total')
        )
            ->whereIn('sales.id', $salesIds)
            ->join('cities', 'sales.city_id', '=', 'cities.id')
            ->whereNotNull('city_id')
            ->groupBy('cities.id', 'cities.name')
            ->orderByDesc('total')
            ->limit($topCityLimit)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->name,
                    'value' => (int) $item->total
                ];
            })
            ->toArray();

        // Get top subdistricts
        $topSubdistricts = Sales::select(
            'subdistricts.name',
            DB::raw('COUNT(sales.id) as total')
        )
            ->whereIn('sales.id', $salesIds)
            ->join('subdistricts', 'sales.subdistrict_id', '=', 'subdistricts.id')
            ->whereNotNull('subdistrict_id')
            ->groupBy('subdistricts.id', 'subdistricts.name')
            ->orderByDesc('total')
            ->limit($topSubdistrictLimit)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->name,
                    'value' => (int) $item->total
                ];
            })
            ->toArray();

        return Inertia::render('Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at?->format('Y-m-d'),
            ],
            'performance' => [
                'totalProduct' => (int) $totalProducts,
                'lunas' => [
                    'count' => $lunasCount,
                    'amount' => (float) $lunasAmount,
                ],
                'belumLunas' => [
                    'count' => $belumLunasCount,
                    'amount' => (float) $belumLunasAmount,
                ],
                'topProducts' => $topProducts,
                'topSizes' => $topSizes,
                'topCities' => $topCities,
                'topSubdistricts' => $topSubdistricts,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'all_time' => $allTime,
            ]
        ]);
    }
}
