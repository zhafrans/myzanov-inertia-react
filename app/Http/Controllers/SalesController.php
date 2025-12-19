<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Sales;
use App\Models\SalesInstallment;
use App\Models\SalesOutstanding;
use App\Models\SalesItem;
use App\Models\User;
use App\Models\Province;
use App\Models\City;
use App\Models\Subdistrict;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Sales::with(['items', 'installments', 'outstanding', 'seller'])
            ->select([
                'sales.*',
                DB::raw('(sales.price - COALESCE(SUM(sales_installments.installment_amount), 0)) as remaining_amount')
            ])
            ->leftJoin('sales_installments', 'sales.id', '=', 'sales_installments.sale_id')
            ->groupBy('sales.id');

        // Filter berdasarkan size
        if ($request->filled('size') && $request->size !== 'all') {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('size', $request->size);
            });
        }

        // Filter berdasarkan status lunas
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'paid') {
                $query->havingRaw('remaining_amount <= 0');
            } elseif ($request->status === 'unpaid') {
                $query->havingRaw('remaining_amount > 0');
            }
        }

        // Filter berdasarkan rentang tanggal
        if ($request->filled('startDate')) {
            $query->whereDate('sales.transaction_at', '>=', $request->startDate);
        }

        if ($request->filled('endDate')) {
            $query->whereDate('sales.transaction_at', '<=', $request->endDate);
        }

        // Filter belum tertagih bulan ini
        if ($request->boolean('notCollectedThisMonth')) {
            $currentMonth = now()->format('Y-m');
            $oneMonthAgo = now()->subMonth()->format('Y-m-d');

            $query->havingRaw('remaining_amount > 0')
                ->where(function ($q) use ($currentMonth, $oneMonthAgo) {
                    $q->whereDoesntHave('installments', function ($subQ) use ($currentMonth) {
                        $subQ->whereRaw("DATE_FORMAT(payment_date, '%Y-%m') = ?", [$currentMonth]);
                    })
                        ->orWhereHas('installments', function ($subQ) use ($oneMonthAgo) {
                            $subQ->whereRaw('payment_date < ?', [$oneMonthAgo])
                                ->whereRaw('payment_date = (SELECT MAX(payment_date) FROM sales_installments WHERE sale_id = sales.id)');
                        });
                });
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('card_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($q) use ($search) {
                        $q->where('product_name', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sort = $request->input('sort', 'desc');
        $query->orderBy('created_at', $sort);

        // Pagination
        $perPage = $request->input('perPage', 10);
        $sales = $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($sale) {
                return [
                    'id' => $sale->id,
                    'invoice' => $sale->invoice,
                    'card_number' => $sale->card_number,
                    'customer_name' => $sale->customer_name,
                    'sales' => $sale->seller?->name ?? 'N/A',
                    'product' => $sale->items->first()?->product_name ?? 'N/A',
                    'color' => $sale->items->first()?->color ?? 'N/A',
                    'size' => $sale->items->first()?->size ?? 'N/A',
                    'address' => $sale->address,
                    'date' => Carbon::parse($sale->transaction_at)->format('Y-m-d'),
                    'transaction_at' => $sale->transaction_at,
                    'price' => (float) $sale->price,
                    'remaining' => (float) $sale->remaining_amount,
                    'last_collected_at' => $sale->installments->sortByDesc('payment_date')->first()?->payment_date
                        ? Carbon::parse($sale->installments->sortByDesc('payment_date')->first()->payment_date)->format('Y-m-d')
                        : null,
                    'status' => $sale->remaining_amount <= 0 ? 'paid' : 'unpaid',
                    'province_id' => $sale->province_id,
                    'city_id' => $sale->city_id,
                    'subdistrict_id' => $sale->subdistrict_id,
                    'village_id' => $sale->village_id,
                    'payment_type' => $sale->payment_type,
                    'is_tempo' => $sale->is_tempo,
                    'tempo_at' => $sale->tempo_at,
                    'note' => $sale->note,
                    'seller_id' => $sale->seller_id,
                ];
            });

        // Get unique sizes for filter
        $sizes = SalesItem::select('size')
            ->distinct()
            ->orderBy('size')
            ->pluck('size');

        // Get collectors
        $collectors = User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => [
                'size' => $request->size ?? 'all',
                'sort' => $request->sort ?? 'desc',
                'status' => $request->status ?? 'all',
                'notCollectedThisMonth' => $request->boolean('notCollectedThisMonth'),
                'search' => $request->search ?? '',
            ],
            'availableSizes' => $sizes,
            'collectors' => $collectors,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::select('id', 'name')->get();
        $provinces = Province::orderBy('name')->get();

        return Inertia::render('Sales/Create', [
            'users' => $users,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'card_number' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'customer_name' => 'required|string',
            'province_id' => 'nullable|string',
            'city_id' => 'nullable|string',
            'subdistrict_id' => 'nullable|string',
            'village_id' => 'nullable|string',
            'address' => 'required|string',
            'seller_id' => 'nullable|exists:users,id',
            'payment_type' => 'required|string',
            'status' => 'required|string',
            'transaction_at' => 'required|date',
            'is_tempo' => 'nullable|string',
            'tempo_at' => 'nullable|date',
            'note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string',
            'items.*.color' => 'required|string',
            'items.*.size' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // Generate Invoice
            $lastSale = Sales::latest()->first();
            $lastId = $lastSale ? $lastSale->id : 0;
            $invoice = 'INV-' . date('Ymd') . '-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);

            // Separate items from sale data
            $items = $validated['items'];
            unset($validated['items']);

            // Add invoice to sale data
            $validated['invoice'] = $invoice;

            // Create sale (without items)
            $sale = Sales::create($validated);

            // Create sale items
            foreach ($items as $item) {
                $sale->items()->create($item);
            }

            // Jika pembayaran tempo, buat outstanding record
            if ($request->is_tempo === 'yes') {
                $sale->outstanding()->create([
                    'outstanding_amount' => $request->price
                ]);
            }

            // Log activity
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'create',
                'module' => 'sales',
                'description' => "Membuat penjualan baru: {$sale->invoice} - {$sale->customer_name}",
                'model_id' => $sale->id,
                'model_type' => Sales::class,
                'new_values' => [
                    'sale' => $sale->toArray(),
                    'items' => $sale->items->toArray(),
                    'outstanding' => $request->is_tempo === 'yes' ? ['outstanding_amount' => $request->price] : null
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return redirect()->route('sales.index')
                ->with('success', 'Sale created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            // Log error activity
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'create',
                'module' => 'sales',
                'description' => "Gagal membuat penjualan: " . $e->getMessage(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return back()->with('error', 'Failed to create sale: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sale = Sales::with([
            'items',
            'installments' => function ($query) {
                $query->orderBy('payment_date', 'desc')
                    ->with('collector');
            },
            'outstanding',
            'seller',
            'province',
            'city',
            'subdistrict',
            'village',
        ])
            ->findOrFail($id);

        // Hitung total pembayaran
        $totalPaid = $sale->installments->sum('installment_amount');
        $remainingAmount = $sale->price - $totalPaid;

        // Format installments untuk frontend
        $installments = $sale->installments->map(function ($installment, $index) {
            return [
                'number' => $index + 1,
                'date' => Carbon::parse($installment->payment_date)->format('d-m-Y'),
                'amount' => (float) $installment->installment_amount,
                'collector' => $installment->collector?->name ?? 'N/A',
                'collector_id' => $installment->collector_id,
                'payment_date' => Carbon::parse($installment->payment_date)->format('Y-m-d'),
                'installment_amount' => (float) $installment->installment_amount,
            ];
        });

        // Format items untuk frontend
        $items = $sale->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product' => $item->product_name,
                'color' => $item->color,
                'size' => $item->size,
                'quantity' => (int) $item->quantity,
                'price_per_item' => $item->price ?? 0,
            ];
        });

        // Ambil data collectors
        $collectors = User::query()
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            });

        return Inertia::render('Sales/Show', [
            'sale' => [
                'id' => $sale->id,
                'invoice' => $sale->invoice,
                'card_number' => $sale->card_number,
                'price' => (float) $sale->price,
                'customer_name' => $sale->customer_name,
                'province_id' => $sale->province_id,
                'province_name' => $sale->province?->name,
                'city_id' => $sale->city_id,
                'city_name' => $sale->city?->name,
                'subdistrict_id' => $sale->subdistrict_id,
                'subdistrict_name' => $sale->subdistrict?->name,
                'village_id' => $sale->village_id,
                'village_name' => $sale->village?->name,
                'address' => $sale->address,
                'seller' => $sale->seller?->name,
                'seller_id' => $sale->seller_id,
                'payment_type' => $sale->payment_type,
                'status' => $sale->status,
                'transaction_at' => Carbon::parse($sale->transaction_at)->format('Y-m-d H:i:s'),
                'transaction_date' => Carbon::parse($sale->transaction_at)->format('d-m-Y'),
                'is_tempo' => $sale->is_tempo,
                'tempo_at' => $sale->tempo_at ? Carbon::parse($sale->tempo_at)->format('Y-m-d') : null,
                'tempo_at_formatted' => $sale->tempo_at ? Carbon::parse($sale->tempo_at)->format('d-m-Y') : null,
                'note' => $sale->note,
                'is_printed' => $sale->is_printed,
                'phone' => $sale->phone ?? '-',

                // Data terstruktur untuk frontend
                'customer' => [
                    'cardNo' => $sale->card_number,
                    'name' => $sale->customer_name,
                    'phone' => $sale->phone ?? '-',
                ],
                'address_info' => [
                    'street' => $sale->address,
                    'subdistrict' => $sale->subdistrict?->name,
                    'city' => $sale->city?->name,
                    'province' => $sale->province?->name,
                    'village' => $sale->village?->name,
                ],
                'salesName' => $sale->seller?->name,
                'salesId' => $sale->seller_id,
                'items' => $items,
                'installments' => $installments,
                'total_paid' => (float) $totalPaid,
                'remaining' => (float) $remainingAmount,
                'is_lunas' => $remainingAmount <= 0,
            ],
            'collectors' => $collectors,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $sale = Sales::with(['items', 'installments', 'outstanding'])->findOrFail($id);
        $users = User::select('id', 'name')->get();

        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sale = Sales::findOrFail($id);
        $oldValues = $sale->toArray();
        $oldItems = $sale->items->toArray();
        $oldOutstanding = $sale->outstanding?->toArray();

        $validated = $request->validate([
            'card_number' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'customer_name' => 'required|string',
            'province_id' => 'nullable|string',
            'city_id' => 'nullable|string',
            'subdistrict_id' => 'nullable|string',
            'village_id' => 'nullable|string',
            'address' => 'required|string',
            'seller_id' => 'nullable|exists:users,id',
            'payment_type' => 'required|string',
            'status' => 'required|string',
            'transaction_at' => 'required|date',
            'is_tempo' => 'nullable|string',
            'tempo_at' => 'nullable|date',
            'note' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $sale->update($validated);
            $newValues = $sale->fresh()->toArray();

            // Filter field yang tidak perlu di-log
            $ignoredFields = ['created_at', 'updated_at', 'email_verified_at'];

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

            // Log activity
            if (!empty($changedFields)) {
                ActivityLog::create([
                    'user_id' => auth()->id(),
                    'action' => 'update',
                    'module' => 'sales',
                    'description' => "Mengupdate penjualan: {$sale->invoice} - {$sale->customer_name}",
                    'model_id' => $sale->id,
                    'model_type' => Sales::class,
                    'old_values' => array_intersect_key($oldValues, $changedFields),
                    'new_values' => $changedFields,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            } else {
                ActivityLog::create([
                    'user_id' => auth()->id(),
                    'action' => 'update',
                    'module' => 'sales',
                    'description' => "Mencoba mengupdate penjualan: {$sale->invoice} - {$sale->customer_name} (tidak ada perubahan)",
                    'model_id' => $sale->id,
                    'model_type' => Sales::class,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            }

            DB::commit();

            return redirect()->route('sales.index')
                ->with('success', 'Sale updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'module' => 'sales',
                'description' => "Gagal mengupdate penjualan {$sale->invoice}: " . $e->getMessage(),
                'model_id' => $sale->id,
                'model_type' => Sales::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return back()->with('error', 'Failed to update sale: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $sale = Sales::with(['items', 'installments', 'outstanding'])->findOrFail($id);

            $oldValues = $sale->toArray();
            $oldItems = $sale->items->toArray();
            $oldInstallments = $sale->installments->toArray();
            $oldOutstanding = $sale->outstanding?->toArray();

            // Delete related records
            $sale->items()->delete();
            $sale->installments()->delete();
            $sale->outstanding()->delete();

            // Delete sale
            $sale->delete();

            // Log activity
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'delete',
                'module' => 'sales',
                'description' => "Menghapus penjualan: {$oldValues['invoice']} - {$oldValues['customer_name']}",
                'model_id' => $oldValues['id'],
                'model_type' => Sales::class,
                'old_values' => [
                    'sale' => $oldValues,
                    'items' => $oldItems,
                    'installments' => $oldInstallments,
                    'outstanding' => $oldOutstanding
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return redirect()->route('sales.index')
                ->with('success', 'Sale deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'delete',
                'module' => 'sales',
                'description' => "Gagal menghapus penjualan: " . $e->getMessage(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return back()->with('error', 'Failed to delete sale: ' . $e->getMessage());
        }
    }

    /**
     * Create installment for a sale.
     */
    public function createInstallment(Request $request, string $id)
    {
        $validated = $request->validate([
            'installment_amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'collector_id' => 'nullable|exists:users,id',
        ]);

        $sale = Sales::with(['installments', 'outstanding'])->findOrFail($id);

        DB::beginTransaction();

        try {
            // Hitung sisa tagihan
            $totalPaid = $sale->installments()->sum('installment_amount');
            $remainingAmount = $sale->price - $totalPaid;

            // Validasi apakah jumlah installment tidak melebihi sisa tagihan
            if ($validated['installment_amount'] > $remainingAmount) {
                return back()->withErrors([
                    'installment_amount' => 'Jumlah installment melebihi sisa tagihan.'
                ]);
            }

            // Buat installment
            $installment = SalesInstallment::create([
                'sale_id' => $sale->id,
                'installment_amount' => $validated['installment_amount'],
                'payment_date' => $validated['payment_date'],
                'collector_id' => $validated['collector_id'],
            ]);

            // Update outstanding amount jika ada
            if ($sale->outstanding) {
                $newOutstanding = $remainingAmount - $validated['installment_amount'];
                $sale->outstanding()->update([
                    'outstanding_amount' => $newOutstanding
                ]);
            }

            // Log activity untuk pembuatan installment
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'create',
                'module' => 'sales_installments',
                'description' => "Membuat installment untuk penjualan: {$sale->invoice} - {$sale->customer_name}",
                'model_id' => $installment->id,
                'model_type' => SalesInstallment::class,
                'new_values' => $installment->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return redirect()->route('sales.show', $id)
                ->with('success', 'Installment berhasil ditambahkan.')
                ->with('remaining_amount', $remainingAmount - $validated['installment_amount']);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan installment: ' . $e->getMessage());
        }
    }

    /**
     * Get installment history for a sale.
     */
    public function getInstallments(string $id)
    {
        $installments = SalesInstallment::with('collector')
            ->where('sale_id', $id)
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($installment) {
                return [
                    'id' => $installment->id,
                    'amount' => (float) $installment->installment_amount,
                    'payment_date' => Carbon::parse($installment->payment_date)->format('Y-m-d') ?? null,
                    'collector' => $installment->collector?->name,
                    'created_at' => Carbon::parse($installment->created_at)->format('Y-m-d H:i:s') ?? null,
                ];
            });

        return response()->json($installments);
    }

    public function getProvinces()
    {
        $provinces = Province::orderBy('name')->get();
        return response()->json($provinces);
    }

    public function getCities($provinceId)
    {
        $cities = City::where('province_id', $provinceId)->orderBy('name')->get();
        return response()->json($cities);
    }

    public function getSubdistricts($cityId)
    {
        $subdistricts = Subdistrict::where('city_id', $cityId)->orderBy('name')->get();
        return response()->json($subdistricts);
    }

    public function getVillages($subdistrictId)
    {
        $villages = Village::where('subdistrict_id', $subdistrictId)->orderBy('name')->get();
        return response()->json($villages);
    }

    /**
     * Export sales data to Excel
     */
    public function export(Request $request)
    {
        $filters = $request->only([
            'size',
            'status',
            'startDate',
            'endDate',
            'search',
            'sort',
            'notCollectedThisMonth'
        ]);

        $filename = 'sales_export_' . now()->format('Y-m-d_His') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\SalesExport($filters),
            $filename
        );
    }
}
