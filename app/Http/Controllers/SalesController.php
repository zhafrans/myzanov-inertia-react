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
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Sales::with(['items', 'installments.collector', 'outstanding', 'seller', 'city', 'subdistrict'])
            ->select([
                'sales.*',
                DB::raw('(sales.price - COALESCE(SUM(sales_installments.installment_amount), 0)) as remaining_amount')
            ])
            ->leftJoin('sales_installments', 'sales.id', '=', 'sales_installments.sale_id')
            ->groupBy('sales.id');

        // Filter berdasarkan payment type
        if ($request->filled('payment_type') && $request->payment_type !== 'all') {
            $query->where('sales.payment_type', $request->payment_type);
        }

        // Filter berdasarkan seller_id
        if ($request->filled('seller_id') && $request->seller_id !== 'all') {
            $query->where('sales.seller_id', $request->seller_id);
        }

        // Filter berdasarkan lokasi
        if ($request->filled('province_id')) {
            $query->where('sales.province_id', $request->province_id);
        }
        if ($request->filled('city_id')) {
            $query->where('sales.city_id', $request->city_id);
        }
        if ($request->filled('subdistrict_id')) {
            $query->where('sales.subdistrict_id', $request->subdistrict_id);
        }
        if ($request->filled('village_id')) {
            $query->where('sales.village_id', $request->village_id);
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

        // Search - mencari di semua kolom sales table
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sales.invoice', 'like', "%{$search}%")
                    ->orWhere('sales.card_number', 'like', "%{$search}%")
                    ->orWhere('sales.customer_name', 'like', "%{$search}%")
                    ->orWhere('sales.phone', 'like', "%{$search}%")
                    ->orWhere('sales.address', 'like', "%{$search}%")
                    ->orWhere('sales.payment_type', 'like', "%{$search}%")
                    ->orWhere('sales.status', 'like', "%{$search}%")
                    ->orWhere('sales.note', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($q) use ($search) {
                        $q->where('product_name', 'like', "%{$search}%")
                          ->orWhere('color', 'like', "%{$search}%")
                          ->orWhere('size', 'like', "%{$search}%");
                    })
                    ->orWhereHas('city', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('subdistrict', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('province', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
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
                // Ambil installment terakhir yang BUKAN DP (jika ada)
                $lastNonDpInstallment = $sale->installments
                    ->where('is_dp', false)
                    ->sortByDesc('payment_date')
                    ->first();

                // Ambil installment DP jika ada
                $dpInstallment = $sale->installments
                    ->where('is_dp', true)
                    ->first();

                // Tentukan installment yang akan ditampilkan
                $installmentToShow = $lastNonDpInstallment ?? $dpInstallment;
                $isDpToShow = $installmentToShow ? $installmentToShow->is_dp : false;
                $lastInstallmentAmount = $installmentToShow ? $installmentToShow->installment_amount : 0;
                $lastPaymentDate = $installmentToShow ? $installmentToShow->payment_date : null;
                $lastCollectorName = $installmentToShow && $installmentToShow->collector ? $installmentToShow->collector->name : null;

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
                    'subdistrict_name' => $sale->subdistrict?->name,
                    'city_name' => $sale->city?->name,
                    'date' => Carbon::parse($sale->transaction_at)->format('Y-m-d'),
                    'transaction_at' => $sale->transaction_at,
                    'price' => (float) $sale->price,
                    'remaining' => (float) $sale->remaining_amount,
                    'last_collected_at' => $lastPaymentDate
                        ? Carbon::parse($lastPaymentDate)->format('Y-m-d')
                        : null,
                    'last_installment_is_dp' => $isDpToShow,
                    'last_installment_amount' => $lastInstallmentAmount ? (float) $lastInstallmentAmount : 0,
                    'last_collector_name' => $lastCollectorName,
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

        // Get collectors
        $collectors = User::select('id', 'name')->orderBy('name')->get();

        // Get sellers (users who have sales)
        $sellers = User::select('id', 'name')
            ->whereHas('sales')
            ->orderBy('name')
            ->get();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => [
                'sort' => $request->sort ?? 'desc',
                'status' => $request->status ?? 'all',
                'payment_type' => $request->payment_type ?? 'all',
                'notCollectedThisMonth' => $request->boolean('notCollectedThisMonth'),
                'search' => $request->search ?? '',
                'startDate' => $request->startDate ?? '',
                'endDate' => $request->endDate ?? '',
                'seller_id' => $request->seller_id ?? 'all',
                'province_id' => $request->province_id ?? '',
                'city_id' => $request->city_id ?? '',
                'subdistrict_id' => $request->subdistrict_id ?? '',
                'village_id' => $request->village_id ?? '',
            ],
            'collectors' => $collectors,
            'sellers' => $sellers,
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
            'province_id' => 'required',
            'city_id' => 'required|string',
            'subdistrict_id' => 'required|string',
            'village_id' => 'nullable|string',
            'address' => 'required|string',
            'seller_id' => 'required|exists:users,id',
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
            'items.*.price' => 'required|numeric|min:0',
            // DP fields
            'has_dp' => 'nullable|boolean',
            'dp_amount' => 'nullable|numeric|min:0|required_if:has_dp,true',
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

            // Remove DP fields from sale data
            $hasDp = $validated['has_dp'] ?? false;
            $dpAmount = $validated['dp_amount'] ?? null;
            unset($validated['has_dp']);
            unset($validated['dp_amount']);

            // Add invoice to sale data
            $validated['invoice'] = $invoice;

            // Create sale (without items)
            $sale = Sales::create($validated);

            // Create sale items with price_per_item
            foreach ($items as $item) {
                $sale->items()->create([
                    'product_name' => $item['product_name'],
                    'color' => $item['color'],
                    'size' => $item['size'],
                    'quantity' => $item['quantity'],
                    'price_per_item' => $item['price'] ?? 0,
                ]);
            }

            // Variabel untuk outstanding amount
            $outstandingAmount = 0;
            $isPaid = false;

            if ($request->payment_type === 'cash') {
                // Untuk cash, buat installment penuh
                SalesInstallment::create([
                    'sale_id' => $sale->id,
                    'installment_amount' => $request->price,
                    'payment_date' => $request->transaction_at,
                    'collector_id' => null,
                    'is_dp' => false,
                ]);

                // Set outstanding amount ke 0 karena sudah lunas
                $outstandingAmount = 0;
                $isPaid = true;
            } else {
                // Untuk credit dan cash_tempo, hitung outstanding amount
                $outstandingAmount = $request->price;

                // Jika ada DP, kurangi outstanding amount
                if ($hasDp && $dpAmount !== null && $dpAmount > 0) {
                    SalesInstallment::create([
                        'sale_id' => $sale->id,
                        'installment_amount' => $dpAmount,
                        'payment_date' => $request->transaction_at,
                        'is_dp' => true,
                        'collector_id' => null,
                    ]);

                    $outstandingAmount -= $dpAmount;
                }
            }

            // SELALU buat outstanding record untuk SEMUA tipe pembayaran
            $sale->outstanding()->create([
                'outstanding_amount' => $outstandingAmount
            ]);

            // Update status jika outstanding sudah <= 0
            if ($isPaid || $outstandingAmount <= 0) {
                $sale->update(['status' => 'paid']);
            } else {
                $sale->update(['status' => 'unpaid']);
            }

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'create',
                'module' => 'sales',
                'description' => "Membuat penjualan baru: {$sale->invoice} - {$sale->customer_name}",
                'model_id' => $sale->id,
                'model_type' => Sales::class,
                'new_values' => [
                    'sale' => $sale->toArray(),
                    'items' => $sale->items->toArray(),
                    'dp' => $hasDp ? ['amount' => $dpAmount] : null,
                    'outstanding' => ['outstanding_amount' => $outstandingAmount]
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
                'user_id' => Auth::id(),
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
                $query->orderBy('payment_date', 'asc')
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
                'id' => $installment->id,
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
        $items = $sale->items->map(function ($item) use ($sale) {
            // Calculate price per item (total price / quantity)
            $pricePerItem = $item->price_per_item ?? ($sale->price / $item->quantity);
            
            return [
                'id' => $item->id,
                'product' => $item->product_name,
                'color' => $item->color,
                'size' => $item->size,
                'quantity' => (int) $item->quantity,
                'price' => (float) $pricePerItem,
                'price_per_item' => (float) $pricePerItem,
                'print_count' => (int) ($item->print_count ?? 0),
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
        $sale = Sales::with(['outstanding'])->findOrFail($id);
        $oldValues = $sale->toArray();

        $validated = $request->validate([
            'card_number' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'customer_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'province_id' => 'nullable|string',
            'city_id' => 'nullable|string',
            'subdistrict_id' => 'nullable|string',
            'village_id' => 'nullable|string',
            'address' => 'nullable|string',
            'seller_id' => 'nullable|exists:users,id',
            'payment_type' => 'nullable|string|in:cash,credit,cash_tempo',
            'status' => 'nullable|string|in:paid,unpaid',
            'transaction_at' => 'nullable|date',
            'is_tempo' => 'nullable|string|in:yes,no',
            'tempo_at' => 'nullable|date',
            'note' => 'nullable|string',
            // Additional fields that might be sent but not stored
            'has_dp' => 'nullable|boolean',
            'dp_amount' => 'nullable|numeric|min:0',
            'installment_months' => 'nullable|integer|min:1|max:36',
            'cash_installment_amount' => 'nullable|numeric|min:0',
        ]);

        // Remove fields that are not in the sales table
        unset($validated['has_dp']);
        unset($validated['dp_amount']);
        unset($validated['installment_months']);
        unset($validated['cash_installment_amount']);

        // Convert seller_id to integer if it's a string
        if (isset($validated['seller_id']) && $validated['seller_id'] !== null) {
            $validated['seller_id'] = (int) $validated['seller_id'];
        }

        // Convert is_tempo to proper format
        if (isset($validated['is_tempo'])) {
            $validated['is_tempo'] = $validated['is_tempo'] === 'yes' ? 'yes' : 'no';
        }

        DB::beginTransaction();

        try {
            // Update sale
            $sale->update($validated);

            // Update status berdasarkan outstanding amount (jika ada outstanding record)
            if ($sale->outstanding) {
                if ($sale->outstanding->outstanding_amount <= 0) {
                    $sale->update(['status' => 'paid']);
                } else {
                    $sale->update(['status' => 'unpaid']);
                }
            } else {
                // Jika tidak ada outstanding, gunakan status dari request
                // Tapi tetap validasi berdasarkan payment type
                if ($validated['payment_type'] === 'cash') {
                    $sale->update(['status' => 'paid']);
                }
            }

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
                    'user_id' => Auth::id(),
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
                    'user_id' => Auth::id(),
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
                'user_id' => Auth::id(),
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
                'user_id' => Auth::id(),
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
                'user_id' => Auth::id(),
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

            // Update outstanding amount
            $newOutstanding = $remainingAmount - $validated['installment_amount'];

            // Update outstanding record
            if ($sale->outstanding) {
                $sale->outstanding()->update([
                    'outstanding_amount' => $newOutstanding
                ]);
            } else {
                // Buat outstanding record jika belum ada
                $sale->outstanding()->create([
                    'outstanding_amount' => $newOutstanding
                ]);
            }

            // Update status berdasarkan outstanding amount
            if ($newOutstanding <= 0) {
                $sale->update(['status' => 'paid']);
            } else {
                $sale->update(['status' => 'unpaid']);
            }

            // Log activity untuk pembuatan installment
            ActivityLog::create([
                'user_id' => Auth::id(),
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
                ->with('remaining_amount', $newOutstanding);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan installment: ' . $e->getMessage());
        }
    }

    /**
     * Update an installment.
     */
    public function updateInstallment(Request $request, string $saleId, string $installmentId)
    {
        $validated = $request->validate([
            'installment_amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'collector_id' => 'nullable|exists:users,id',
        ]);

        $sale = Sales::with(['installments', 'outstanding'])->findOrFail($saleId);
        $installment = SalesInstallment::findOrFail($installmentId);

        // Pastikan installment milik sale yang benar
        if ($installment->sale_id != $sale->id) {
            return back()->withErrors([
                'installment' => 'Installment tidak ditemukan untuk sale ini.'
            ]);
        }

        DB::beginTransaction();

        try {
            // Simpan nilai lama untuk perhitungan dan activity log
            $oldAmount = $installment->installment_amount;
            $oldPaymentDate = $installment->payment_date;
            $oldCollectorId = $installment->collector_id;

            // Hitung total pembayaran tanpa installment yang akan diupdate
            $totalPaid = $sale->installments()
                ->where('id', '!=', $installmentId)
                ->sum('installment_amount');
            
            $remainingAmount = $sale->price - $totalPaid;

            // Validasi apakah jumlah installment baru tidak melebihi sisa tagihan
            if ($validated['installment_amount'] > $remainingAmount) {
                return back()->withErrors([
                    'installment_amount' => 'Jumlah installment melebihi sisa tagihan yang tersedia.'
                ]);
            }

            // Update installment
            $installment->update([
                'installment_amount' => $validated['installment_amount'],
                'payment_date' => $validated['payment_date'],
                'collector_id' => $validated['collector_id'],
            ]);

            // Hitung ulang outstanding amount dengan installment yang sudah diupdate
            $newTotalPaid = $sale->installments()->sum('installment_amount');
            $newOutstanding = $sale->price - $newTotalPaid;

            // Update outstanding record
            if ($sale->outstanding) {
                $sale->outstanding()->update([
                    'outstanding_amount' => $newOutstanding
                ]);
            } else {
                // Buat outstanding record jika belum ada
                $sale->outstanding()->create([
                    'outstanding_amount' => $newOutstanding
                ]);
            }

            // Update status berdasarkan outstanding amount
            if ($newOutstanding <= 0) {
                $sale->update(['status' => 'paid']);
            } else {
                $sale->update(['status' => 'unpaid']);
            }

            // Log activity untuk update installment
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'sales_installments',
                'description' => "Mengupdate installment untuk penjualan: {$sale->invoice} - {$sale->customer_name}",
                'model_id' => $installment->id,
                'model_type' => SalesInstallment::class,
                'old_values' => [
                    'installment_amount' => $oldAmount,
                    'payment_date' => $oldPaymentDate,
                    'collector_id' => $oldCollectorId,
                ],
                'new_values' => $installment->fresh()->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            DB::commit();

            return redirect()->route('sales.show', $saleId)
                ->with('success', 'Installment berhasil diupdate.')
                ->with('remaining_amount', $newOutstanding);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengupdate installment: ' . $e->getMessage());
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

    public function getUsers()
    {
        $users = User::select('id', 'name')->orderBy('name')->get();
        return response()->json($users);
    }

    /**
     * Export sales data to Excel
     */
    public function export(Request $request)
    {
        $filters = $request->only([
            'status',
            'payment_type',
            'seller_id',
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

    /**
     * Collector index - melihat riwayat tagihan
     */
    public function collectorIndex(Request $request)
    {
        $currentUser = Auth::user();
        $currentUserId = $currentUser->id;
        $currentUserRole = $currentUser->role ?? null;

        // Jika role != collector, bisa pilih collector (default: semua)
        // Jika role == collector, hanya tampilkan data collector tersebut
        // KECUALI jika nama user adalah 'Lukman', dia bisa lihat semua meski role collector
        if (strcasecmp($currentUserRole, 'collector') === 0 && $currentUser->name !== 'Lukman') {
            $selectedCollectorId = $currentUserId;
            $showAllCollectors = false;
        } else {
            // Jika ada filter collector_id, gunakan itu
            // Jika tidak ada, tampilkan semua (null = semua)
            $selectedCollectorId = $request->input('collector_id');
            $showAllCollectors = $selectedCollectorId === null || $selectedCollectorId === 'all' || $selectedCollectorId === '';
        }

        // Query dari SalesInstallment sebagai base, join ke Sales untuk mendapatkan informasi sales
        $query = SalesInstallment::with([
            'sale.items',
            'sale.outstanding',
            'sale.seller',
            'sale.city',
            'sale.subdistrict',
            'collector'
        ])
            ->select([
                'sales_installments.*',
                'sales.invoice',
                'sales.card_number',
                'sales.customer_name',
                'sales.address',
                'sales.transaction_at',
                'sales.price',
                'sales.payment_type',
                'sales.seller_id',
                'sales.city_id',
                'sales.subdistrict_id',
                DB::raw('(sales.price - COALESCE((SELECT SUM(installment_amount) FROM sales_installments WHERE sale_id = sales.id), 0)) as remaining_amount')
            ])
            ->join('sales', 'sales_installments.sale_id', '=', 'sales.id')
            ->whereNotNull('sales_installments.collector_id');

        // Filter berdasarkan collector_id jika dipilih
        if (!$showAllCollectors && $selectedCollectorId) {
            $query->where('sales_installments.collector_id', $selectedCollectorId);
        }

        // Filter berdasarkan payment type (dari sales)
        if ($request->filled('payment_type') && $request->payment_type !== 'all') {
            $query->where('sales.payment_type', $request->payment_type);
        }

        // Filter berdasarkan lokasi
        if ($request->filled('province_id')) {
            $query->where('sales.province_id', $request->province_id);
        }
        if ($request->filled('city_id')) {
            $query->where('sales.city_id', $request->city_id);
        }
        if ($request->filled('subdistrict_id')) {
            $query->where('sales.subdistrict_id', $request->subdistrict_id);
        }
        if ($request->filled('village_id')) {
            $query->where('sales.village_id', $request->village_id);
        }

        // Filter berdasarkan status lunas (berdasarkan remaining_amount dari sales)
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'paid') {
                $query->whereRaw('(sales.price - COALESCE((SELECT SUM(installment_amount) FROM sales_installments WHERE sale_id = sales.id), 0)) <= 0');
            } elseif ($request->status === 'unpaid') {
                $query->whereRaw('(sales.price - COALESCE((SELECT SUM(installment_amount) FROM sales_installments WHERE sale_id = sales.id), 0)) > 0');
            }
        }

        // Filter berdasarkan rentang tanggal (payment_date dari sales_installments)
        // Jika all_time tidak dipilih, gunakan filter date range
        // Default: bulan ini
        if (!$request->filled('all_time') || !$request->boolean('all_time')) {
            $startDate = $request->input('startDate', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->input('endDate', now()->endOfMonth()->format('Y-m-d'));
            
            $query->whereDate('sales_installments.payment_date', '>=', $startDate)
                  ->whereDate('sales_installments.payment_date', '<=', $endDate);
        }

        // Search (dari sales) - mencari di semua kolom sales table
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sales.invoice', 'like', "%{$search}%")
                    ->orWhere('sales.card_number', 'like', "%{$search}%")
                    ->orWhere('sales.customer_name', 'like', "%{$search}%")
                    ->orWhere('sales.phone', 'like', "%{$search}%")
                    ->orWhere('sales.address', 'like', "%{$search}%")
                    ->orWhere('sales.payment_type', 'like', "%{$search}%")
                    ->orWhere('sales.status', 'like', "%{$search}%")
                    ->orWhere('sales.note', 'like', "%{$search}%")
                    ->orWhereExists(function ($subQ) use ($search) {
                        $subQ->select(DB::raw(1))
                            ->from('users')
                            ->whereColumn('users.id', 'sales.seller_id')
                            ->where(function ($q) use ($search) {
                                $q->where('users.name', 'like', "%{$search}%")
                                  ->orWhere('users.email', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereExists(function ($subQ) use ($search) {
                        $subQ->select(DB::raw(1))
                            ->from('sales_items')
                            ->whereColumn('sales_items.sale_id', 'sales.id')
                            ->where(function ($q) use ($search) {
                                $q->where('sales_items.product_name', 'like', "%{$search}%")
                                  ->orWhere('sales_items.color', 'like', "%{$search}%")
                                  ->orWhere('sales_items.size', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereExists(function ($subQ) use ($search) {
                        $subQ->select(DB::raw(1))
                            ->from('cities')
                            ->whereColumn('cities.id', 'sales.city_id')
                            ->where('cities.name', 'like', "%{$search}%");
                    })
                    ->orWhereExists(function ($subQ) use ($search) {
                        $subQ->select(DB::raw(1))
                            ->from('subdistricts')
                            ->whereColumn('subdistricts.id', 'sales.subdistrict_id')
                            ->where('subdistricts.name', 'like', "%{$search}%");
                    })
                    ->orWhereExists(function ($subQ) use ($search) {
                        $subQ->select(DB::raw(1))
                            ->from('provinces')
                            ->whereColumn('provinces.id', 'sales.province_id')
                            ->where('provinces.name', 'like', "%{$search}%");
                    });
            });
        }

        // Sort berdasarkan payment_date dari sales_installments
        $sort = $request->input('sort', 'desc');
        $query->orderBy('sales_installments.payment_date', $sort);

        // Pagination
        $perPage = $request->input('perPage', 10);
        $installments = $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($installment) {
                $sale = $installment->sale;
                
                return [
                    'id' => $installment->id,
                    'sale_id' => $sale->id,
                    'invoice' => $sale->invoice,
                    'card_number' => $sale->card_number,
                    'customer_name' => $sale->customer_name,
                    'sales' => $sale->seller?->name ?? 'N/A',
                    'product' => $sale->items->first()?->product_name ?? 'N/A',
                    'color' => $sale->items->first()?->color ?? 'N/A',
                    'size' => $sale->items->first()?->size ?? 'N/A',
                    'address' => $sale->address,
                    'subdistrict_name' => $sale->subdistrict?->name,
                    'city_name' => $sale->city?->name,
                    'date' => Carbon::parse($sale->transaction_at)->format('Y-m-d'),
                    'transaction_at' => $sale->transaction_at,
                    'price' => (float) $sale->price,
                    'remaining' => (float) $installment->remaining_amount,
                    'payment_date' => Carbon::parse($installment->payment_date)->format('Y-m-d'),
                    'installment_amount' => (float) $installment->installment_amount,
                    'collector_name' => $installment->collector?->name ?? 'N/A',
                    'collector_id' => $installment->collector_id,
                    'status' => $installment->remaining_amount <= 0 ? 'paid' : 'unpaid',
                    'payment_type' => $sale->payment_type,
                    'is_dp' => $installment->is_dp ?? false,
                    'tempo_at' => $sale->tempo_at,
                ];
            });

        // Get collectors list (jika user bukan collector, tampilkan semua user)
        $collectors = User::select('id', 'name')->orderBy('name')->get();

        // Get chart data (hanya jika ada collector yang dipilih, atau untuk current user jika collector)
        $chartCollectorId = $showAllCollectors ? null : ($selectedCollectorId ?? $currentUserId);
        $chartData = $chartCollectorId ? $this->getCollectorChartData($request, $chartCollectorId) : null;

        return Inertia::render('Collector/Index', [
            'sales' => $installments,
            'collectors' => $collectors,
            'currentUserId' => $currentUserId,
            'currentUserRole' => $currentUserRole,
            'selectedCollectorId' => $selectedCollectorId ? (int) $selectedCollectorId : null,
            'showAllCollectors' => $showAllCollectors,
            'chartData' => $chartData,
            'filters' => [
                'sort' => $request->sort ?? 'desc',
                'status' => $request->status ?? 'all',
                'payment_type' => $request->payment_type ?? 'all',
                'search' => $request->search ?? '',
                'startDate' => $request->startDate ?? now()->startOfMonth()->format('Y-m-d'),
                'endDate' => $request->endDate ?? now()->endOfMonth()->format('Y-m-d'),
                'all_time' => $request->boolean('all_time', false),
                'collector_id' => $selectedCollectorId,
                'province_id' => $request->province_id ?? '',
                'city_id' => $request->city_id ?? '',
                'subdistrict_id' => $request->subdistrict_id ?? '',
                'village_id' => $request->village_id ?? '',
            ],
        ]);
    }

    /**
     * Collector uncollected - belum tertagih bulan ini
     */
    public function collectorUncollected(Request $request)
    {
        $currentUser = Auth::user();
        $currentUserId = $currentUser->id;
        $currentUserRole = $currentUser->role ?? null;

        // Jika role != collector, bisa pilih collector (default: semua)
        // Jika role == collector, hanya tampilkan data collector tersebut
        // KECUALI jika nama user adalah 'Lukman', dia bisa lihat semua meski role collector
        if (strcasecmp($currentUserRole, 'collector') === 0 && $currentUser->name !== 'Lukman') {
            $selectedCollectorId = $currentUserId;
            $showAllCollectors = false;
        } else {
            // Jika ada filter collector_id, gunakan itu
            // Jika tidak ada, tampilkan semua (null = semua)
            $selectedCollectorId = $request->input('collector_id');
            $showAllCollectors = $selectedCollectorId === null || $selectedCollectorId === 'all' || $selectedCollectorId === '';
        }

        $currentMonth = now()->format('Y-m');
        $oneMonthAgo = now()->subMonth()->format('Y-m-d');

        $query = Sales::with(['items', 'installments' => function ($q) {
            $q->whereNotNull('collector_id')
                ->with('collector')
                ->orderBy('payment_date', 'desc');
        }, 'outstanding', 'seller', 'city', 'subdistrict'])
            ->select([
                'sales.*',
                DB::raw('(sales.price - COALESCE(SUM(sales_installments.installment_amount), 0)) as remaining_amount')
            ])
            ->leftJoin('sales_installments', 'sales.id', '=', 'sales_installments.sale_id')
            ->groupBy('sales.id')
            ->havingRaw('remaining_amount > 0');

        // Filter belum tertagih bulan ini
        if (!$showAllCollectors && $selectedCollectorId) {
            // Filter untuk collector tertentu
            $query->where(function ($q) use ($currentMonth, $oneMonthAgo, $selectedCollectorId) {
                $q->whereDoesntHave('installments', function ($subQ) use ($currentMonth, $selectedCollectorId) {
                    $subQ->whereRaw("DATE_FORMAT(payment_date, '%Y-%m') = ?", [$currentMonth])
                        ->where('collector_id', $selectedCollectorId);
                })
                    ->orWhereHas('installments', function ($subQ) use ($oneMonthAgo, $selectedCollectorId) {
                        $subQ->where('collector_id', $selectedCollectorId)
                            ->whereRaw('payment_date < ?', [$oneMonthAgo])
                            ->whereRaw('payment_date = (SELECT MAX(payment_date) FROM sales_installments WHERE sale_id = sales.id AND collector_id = ?)', [$selectedCollectorId]);
                    });
            });
        } else {
            // Filter untuk semua collector
            $query->where(function ($q) use ($currentMonth, $oneMonthAgo) {
                $q->whereDoesntHave('installments', function ($subQ) use ($currentMonth) {
                    $subQ->whereRaw("DATE_FORMAT(payment_date, '%Y-%m') = ?", [$currentMonth])
                        ->whereNotNull('collector_id');
                })
                    ->orWhereHas('installments', function ($subQ) use ($oneMonthAgo) {
                        $subQ->whereNotNull('collector_id')
                            ->whereRaw('payment_date < ?', [$oneMonthAgo])
                            ->whereRaw('payment_date = (SELECT MAX(payment_date) FROM sales_installments WHERE sale_id = sales.id AND collector_id IS NOT NULL)');
                    });
            });
        }

        // Filter berdasarkan payment type
        if ($request->filled('payment_type') && $request->payment_type !== 'all') {
            $query->where('sales.payment_type', $request->payment_type);
        }

        // Filter berdasarkan rentang tanggal (payment_date dari sales_installments)
        if ($request->filled('startDate') || $request->filled('endDate')) {
            $query->where(function ($q) use ($request, $selectedCollectorId, $showAllCollectors) {
                if ($request->filled('startDate') && $request->filled('endDate')) {
                    // Jika kedua tanggal diisi, filter sales yang memiliki installment dengan payment_date dalam range
                    $q->whereHas('installments', function ($subQ) use ($request, $selectedCollectorId, $showAllCollectors) {
                        if (!$showAllCollectors && $selectedCollectorId) {
                            $subQ->where('collector_id', $selectedCollectorId);
                        } else {
                            $subQ->whereNotNull('collector_id');
                        }
                        $subQ->whereBetween('payment_date', [$request->startDate, $request->endDate]);
                    });
                } elseif ($request->filled('startDate')) {
                    // Hanya startDate
                    $q->whereHas('installments', function ($subQ) use ($request, $selectedCollectorId, $showAllCollectors) {
                        if (!$showAllCollectors && $selectedCollectorId) {
                            $subQ->where('collector_id', $selectedCollectorId);
                        } else {
                            $subQ->whereNotNull('collector_id');
                        }
                        $subQ->whereDate('payment_date', '>=', $request->startDate);
                    });
                } elseif ($request->filled('endDate')) {
                    // Hanya endDate
                    $q->whereHas('installments', function ($subQ) use ($request, $selectedCollectorId, $showAllCollectors) {
                        if (!$showAllCollectors && $selectedCollectorId) {
                            $subQ->where('collector_id', $selectedCollectorId);
                        } else {
                            $subQ->whereNotNull('collector_id');
                        }
                        $subQ->whereDate('payment_date', '<=', $request->endDate);
                    });
                }
            });
        }

        // Search - mencari di semua kolom sales table
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sales.invoice', 'like', "%{$search}%")
                    ->orWhere('sales.card_number', 'like', "%{$search}%")
                    ->orWhere('sales.customer_name', 'like', "%{$search}%")
                    ->orWhere('sales.phone', 'like', "%{$search}%")
                    ->orWhere('sales.address', 'like', "%{$search}%")
                    ->orWhere('sales.payment_type', 'like', "%{$search}%")
                    ->orWhere('sales.status', 'like', "%{$search}%")
                    ->orWhere('sales.note', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($q) use ($search) {
                        $q->where('product_name', 'like', "%{$search}%")
                          ->orWhere('color', 'like', "%{$search}%")
                          ->orWhere('size', 'like', "%{$search}%");
                    })
                    ->orWhereHas('city', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('subdistrict', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('province', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
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
            ->through(function ($sale) use ($selectedCollectorId, $showAllCollectors) {
                // Jika tampilkan semua, ambil installment terakhir dari collector manapun
                // Jika filter collector tertentu, ambil installment dari collector tersebut
                if ($showAllCollectors) {
                    $lastInstallment = $sale->installments
                        ->whereNotNull('collector_id')
                        ->sortByDesc('payment_date')
                        ->first();
                } else {
                    $collectorInstallments = $sale->installments->where('collector_id', $selectedCollectorId);
                    $lastInstallment = $collectorInstallments->sortByDesc('payment_date')->first();
                }

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
                    'subdistrict_name' => $sale->subdistrict?->name,
                    'city_name' => $sale->city?->name,
                    'date' => Carbon::parse($sale->transaction_at)->format('Y-m-d'),
                    'transaction_at' => $sale->transaction_at,
                    'price' => (float) $sale->price,
                    'remaining' => (float) $sale->remaining_amount,
                    'last_collected_at' => $lastInstallment ? Carbon::parse($lastInstallment->payment_date)->format('Y-m-d') : null,
                    'last_installment_amount' => $lastInstallment ? (float) $lastInstallment->installment_amount : 0,
                    'last_collector_name' => $lastInstallment && $lastInstallment->collector ? $lastInstallment->collector->name : null,
                    'status' => $sale->remaining_amount <= 0 ? 'paid' : 'unpaid',
                    'payment_type' => $sale->payment_type,
                    'tempo_at' => $sale->tempo_at,
                ];
            });

        // Get collectors list
        $collectors = User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Collector/Uncollected', [
            'sales' => $sales,
            'collectors' => $collectors,
            'currentUserId' => $currentUserId,
            'currentUserRole' => $currentUserRole,
            'selectedCollectorId' => $selectedCollectorId ? (int) $selectedCollectorId : null,
            'showAllCollectors' => $showAllCollectors,
            'filters' => [
                'sort' => $request->sort ?? 'desc',
                'payment_type' => $request->payment_type ?? 'all',
                'search' => $request->search ?? '',
                'startDate' => $request->startDate ?? '',
                'endDate' => $request->endDate ?? '',
                'collector_id' => $selectedCollectorId,
                'province_id' => $request->province_id ?? '',
                'city_id' => $request->city_id ?? '',
                'subdistrict_id' => $request->subdistrict_id ?? '',
                'village_id' => $request->village_id ?? '',
            ],
        ]);
    }

    /**
     * Get collector chart data
     */
    private function getCollectorChartData(Request $request, $collectorId)
    {
        $startDate = null;
        $endDate = null;
        $allTime = false;

        // Cek apakah all_time dipilih
        if ($request->filled('all_time') && $request->boolean('all_time')) {
            $allTime = true;
        } else {
            // Gunakan filter date range dari request jika ada
            if ($request->filled('startDate') && $request->filled('endDate')) {
                try {
                    $startDate = Carbon::parse($request->startDate)->startOfDay();
                    $endDate = Carbon::parse($request->endDate)->endOfDay();
                } catch (\Exception $e) {
                    $startDate = null;
                    $endDate = null;
                }
            }

            // Jika tidak ada filter date range, gunakan bulan ini
            if (!$startDate || !$endDate) {
                $startDate = now()->startOfMonth()->startOfDay();
                $endDate = now()->endOfMonth()->endOfDay();
            }
        }

        // Get monthly collection data
        $monthlyData = $this->getCollectorMonthlyData($startDate, $endDate, $allTime, $collectorId);

        // Get collection by payment type
        $byPaymentType = $this->getCollectorByPaymentType($startDate, $endDate, $allTime, $collectorId);

        // Get average installment count per date range
        $averageCount = $allTime ? $this->getCollectorAverageCountAllTime($collectorId) : $this->getCollectorAverageCount($startDate, $endDate, $collectorId);

        return [
            'monthlyData' => $monthlyData,
            'byPaymentType' => $byPaymentType,
            'averageCount' => $averageCount,
        ];
    }

    /**
     * Get collector monthly data
     */
    private function getCollectorMonthlyData($startDate, $endDate, $allTime, $collectorId)
    {
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

        if ($allTime) {
            $firstInstallment = SalesInstallment::where('collector_id', $collectorId)
                ->orderBy('payment_date', 'asc')
                ->first();
            $lastInstallment = SalesInstallment::where('collector_id', $collectorId)
                ->orderBy('payment_date', 'desc')
                ->first();
            
            if (!$firstInstallment || !$lastInstallment) {
                return [
                    'months' => [],
                    'values' => [],
                ];
            }

            $startDate = Carbon::parse($firstInstallment->payment_date)->startOfMonth();
            $endDate = Carbon::parse($lastInstallment->payment_date)->endOfMonth();
        }

        $daysDiff = $startDate->diffInDays($endDate) + 1;
        $dates = [];
        $dateLabels = [];

        if ($daysDiff <= 31) {
            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                $dates[] = [
                    'start' => $currentDate->copy()->startOfDay(),
                    'end' => $currentDate->copy()->endOfDay()
                ];
                $day = $currentDate->format('d');
                $monthIndex = (int) $currentDate->format('n') - 1;
                $dateLabels[] = $day . ' ' . $monthNames[$monthIndex];
                $currentDate->addDay();
            }
        } else if ($daysDiff <= 93) {
            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                $weekStart = $currentDate->copy()->startOfWeek();
                $weekEnd = $currentDate->copy()->endOfWeek();
                if ($weekEnd->gt($endDate)) {
                    $weekEnd = $endDate->copy();
                }
                
                $dates[] = [
                    'start' => $weekStart,
                    'end' => $weekEnd->copy()->endOfDay()
                ];
                $startDay = $weekStart->format('d');
                $startMonthIndex = (int) $weekStart->format('n') - 1;
                $endDay = $weekEnd->format('d');
                $endMonthIndex = (int) $weekEnd->format('n') - 1;
                $dateLabels[] = $startDay . ' ' . $monthNames[$startMonthIndex] . ' - ' . $endDay . ' ' . $monthNames[$endMonthIndex];
                $currentDate->addWeek();
            }
        } else {
            $currentDate = $startDate->copy()->startOfMonth();
            while ($currentDate->lte($endDate)) {
                $monthStart = $currentDate->copy()->startOfMonth();
                $monthEnd = $currentDate->copy()->endOfMonth();
                
                if ($monthStart->lt($startDate)) {
                    $monthStart = $startDate->copy();
                }
                if ($monthEnd->gt($endDate)) {
                    $monthEnd = $endDate->copy();
                }
                
                $dates[] = [
                    'start' => $monthStart,
                    'end' => $monthEnd->copy()->endOfDay()
                ];
                $monthIndex = (int) $currentDate->format('n') - 1;
                $year = $currentDate->format('Y');
                $dateLabels[] = $monthNames[$monthIndex] . ' ' . $year;
                $currentDate->addMonth();
            }
        }

        $values = [];
        foreach ($dates as $dateRange) {
            $total = SalesInstallment::where('collector_id', $collectorId)
                ->whereBetween('payment_date', [$dateRange['start'], $dateRange['end']])
                ->sum('installment_amount');
            $values[] = (float) $total;
        }

        return [
            'months' => $dateLabels,
            'values' => $values,
        ];
    }

    /**
     * Get collector data by payment type
     */
    private function getCollectorByPaymentType($startDate, $endDate, $allTime, $collectorId)
    {
        $query = SalesInstallment::select(
            'sales.payment_type as name',
            DB::raw('SUM(sales_installments.installment_amount) as total')
        )
            ->join('sales', 'sales_installments.sale_id', '=', 'sales.id')
            ->where('sales_installments.collector_id', $collectorId);

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales_installments.payment_date', [$startDate, $endDate]);
        }

        $data = $query->groupBy('sales.payment_type')
            ->orderByDesc('total')
            ->get();

        return [
            'labels' => $data->pluck('name')->toArray(),
            'values' => $data->pluck('total')->map(function ($val) {
                return (float) $val;
            })->toArray(),
        ];
    }

    /**
     * Get collector average installment count per date range
     */
    private function getCollectorAverageCount($startDate, $endDate, $collectorId)
    {
        if (!$startDate || !$endDate) {
            return [
                'average' => 0,
                'total' => 0,
                'total_amount' => 0,
                'days' => 0,
                'days_with_installments' => 0,
            ];
        }

        // Hitung jumlah installment per hari dalam range
        $installmentsPerDay = SalesInstallment::where('collector_id', $collectorId)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->selectRaw('DATE(payment_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->get();

        // Hitung total installment
        $totalCount = $installmentsPerDay->sum('count');

        // Hitung total nominal (jumlah rupiah) dalam range
        $totalAmount = SalesInstallment::where('collector_id', $collectorId)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('installment_amount');

        // Hitung jumlah hari yang memiliki installment
        $daysWithInstallments = $installmentsPerDay->count();

        // Hitung jumlah hari dalam range (pembulatan ke bawah)
        $totalDays = (int) floor($startDate->diffInDays($endDate) + 1);

        // Hitung rata-rata per hari (berdasarkan hari yang memiliki installment)
        $average = $daysWithInstallments > 0 ? round($totalCount / $daysWithInstallments, 2) : 0;

        return [
            'average' => $average,
            'total' => (int) $totalCount,
            'total_amount' => (float) $totalAmount,
            'days' => (int) $totalDays,
            'days_with_installments' => (int) $daysWithInstallments,
        ];
    }

    /**
     * Get collector average installment count for all time
     */
    private function getCollectorAverageCountAllTime($collectorId)
    {
        // Hitung jumlah installment per hari untuk semua waktu
        $installmentsPerDay = SalesInstallment::where('collector_id', $collectorId)
            ->selectRaw('DATE(payment_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->get();

        // Hitung total installment
        $totalCount = $installmentsPerDay->sum('count');

        // Hitung total nominal (jumlah rupiah) untuk semua waktu
        $totalAmount = SalesInstallment::where('collector_id', $collectorId)
            ->sum('installment_amount');

        // Hitung jumlah hari yang memiliki installment
        $daysWithInstallments = $installmentsPerDay->count();

        // Hitung rata-rata per hari (berdasarkan hari yang memiliki installment)
        $average = $daysWithInstallments > 0 ? round($totalCount / $daysWithInstallments, 2) : 0;

        // Ambil tanggal pertama dan terakhir untuk menghitung total hari
        $firstInstallment = SalesInstallment::where('collector_id', $collectorId)
            ->orderBy('payment_date', 'asc')
            ->first();
        $lastInstallment = SalesInstallment::where('collector_id', $collectorId)
            ->orderBy('payment_date', 'desc')
            ->first();

        $totalDays = 0;
        if ($firstInstallment && $lastInstallment) {
            $startDate = Carbon::parse($firstInstallment->payment_date)->startOfDay();
            $endDate = Carbon::parse($lastInstallment->payment_date)->endOfDay();
            $totalDays = (int) floor($startDate->diffInDays($endDate) + 1);
        }

        return [
            'average' => $average,
            'total' => (int) $totalCount,
            'total_amount' => (float) $totalAmount,
            'days' => (int) $totalDays,
            'days_with_installments' => (int) $daysWithInstallments,
        ];
    }

    /**
     * Print sales item card
     */
    public function printItem(string $saleId, string $itemId)
    {
        $sale = Sales::with([
            'items',
            'installments' => function ($query) {
                $query->orderBy('payment_date', 'asc')
                    ->with('collector');
            },
            'seller',
            'province',
            'city',
            'subdistrict',
            'village',
        ])->findOrFail($saleId);

        $item = $sale->items->find($itemId);
        
        if (!$item) {
            abort(404, 'Item not found');
        }

        // Increment print_count
        $item->increment('print_count');

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'PRINT',
            'module' => 'sales',
            'description' => "Mencetak kartu item: {$item->product_name} - {$item->color} - {$item->size} untuk penjualan {$sale->invoice} - {$sale->customer_name}",
            'model_id' => $sale->id,
            'model_type' => Sales::class,
            'new_values' => [
                'item_id' => $item->id,
                'item' => $item->toArray(),
                'print_count' => $item->print_count,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Get first installment (DP or first payment)
        $firstInstallment = $sale->installments->first();
        
        // Format data untuk print
        $hargaNumeric = (float) $sale->price;
        $printData = [
            'no_kartu' => $sale->card_number ?? '-',
            'nama' => $sale->customer_name ?? '-',
            'no_telp' => $sale->phone ?? '',
            'alamat' => $sale->address ?? '-',
            'kecamatan' => $sale->subdistrict?->name ?? '-',
            'kabupaten' => $sale->city?->name ?? '-',
            'tgl_pengambilan' => $sale->transaction_at ? Carbon::parse($sale->transaction_at)->format('d-m-Y') : '-',
            'nama_produk' => $item->product_name ?? '-',
            'warna' => $item->color ?? '-',
            'size' => $item->size ?? '-',
            'harga' => $hargaNumeric,
            'ket' => $sale->note ?? '',
            'payment_type' => $sale->payment_type ?? '',
            'is_tempo' => $sale->is_tempo === 'yes' || $sale->payment_type === 'cash_tempo',
            'ang1' => $firstInstallment ? (float) $firstInstallment->installment_amount : 0,
            'tgl_ang1' => $firstInstallment ? Carbon::parse($firstInstallment->payment_date)->format('Y-m-d') : '',
            'coll1' => $firstInstallment && $firstInstallment->collector ? $firstInstallment->collector->name : '',
        ];

        return view('sales.print-item', compact('printData'));
    }
}
