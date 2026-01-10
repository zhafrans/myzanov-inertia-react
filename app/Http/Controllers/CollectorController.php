<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use App\Models\SalesItem;
use App\Models\SalesOutstanding;
use App\Models\Subdistrict;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CollectorController extends Controller
{
    public function cardStatistics()
    {
        // Total statistics - only unpaid cards
        $totalCards = SalesItem::whereHas('sale', function ($query) {
            $query->whereNull('is_return');
        })->count();
        
        $unpaidCards = SalesItem::whereHas('sale', function ($query) {
            $query->whereNull('is_return')
                  ->whereHas('outstanding', function ($q) {
                      $q->where('outstanding_amount', '>', 0);
                  });
        })->count();
        
        $unpaidPercentage = $totalCards > 0 ? round(($unpaidCards / $totalCards) * 100, 2) : 0;

        // Statistics per seller - simplified approach
        $sellerStats = [];
        $sellerQuery = Sales::select(
            'users.name',
            DB::raw('COUNT(sales.id) as total'),
            DB::raw('SUM(CASE WHEN sales_outstandings.outstanding_amount > 0 THEN 1 ELSE 0 END) as unpaid')
        )
            ->join('users', 'sales.seller_id', '=', 'users.id')
            ->join('sales_outstandings', 'sales.id', '=', 'sales_outstandings.sale_id')
            ->whereNull('sales.is_return')
            ->groupBy('users.id', 'users.name')
            ->orderBy('users.name')
            ->get();

        foreach ($sellerQuery as $seller) {
            $sellerStats[] = [
                'seller_id' => $seller->seller_id,
                'seller_name' => $seller->name,
                'unpaid' => $seller->unpaid,
                'unpaid_percentage' => $seller->total > 0 ? round(($seller->unpaid / $seller->total) * 100, 2) : 0,
            ];
        }

        // Statistics per subdistrict (unpaid cards only) - following dashboard pattern
        $subdistrictQuery = Sales::select(
            'subdistricts.name as subdistrict_name',
            'cities.name as city_name',
            DB::raw('COUNT(sales.id) as unpaid_count')
        )
            ->join('subdistricts', 'sales.subdistrict_id', '=', 'subdistricts.id')
            ->join('cities', 'sales.city_id', '=', 'cities.id')
            ->join('sales_outstandings', 'sales.id', '=', 'sales_outstandings.sale_id')
            ->whereNull('sales.is_return')
            ->where('sales_outstandings.outstanding_amount', '>', 0)
            ->groupBy('subdistricts.id', 'subdistricts.name', 'cities.id', 'cities.name')
            ->orderByDesc('unpaid_count')
            ->limit(10)
            ->get();

        $subdistrictStats = $subdistrictQuery->map(function ($item) {
            return [
                'subdistrict_id' => $item->subdistrict_id ?? 0,
                'subdistrict_name' => $item->subdistrict_name,
                'city_name' => $item->city_name,
                'unpaid_count' => $item->unpaid_count,
            ];
        })->toArray();

        // Calculate percentages for subdistricts
        $totalUnpaidCards = array_sum(array_column($subdistrictStats, 'unpaid_count'));
        foreach ($subdistrictStats as &$stat) {
            $stat['percentage'] = $totalUnpaidCards > 0 ? round(($stat['unpaid_count'] / $totalUnpaidCards) * 100, 2) : 0;
        }

        // Statistics per city (unpaid cards only) - following dashboard pattern
        $cityQuery = Sales::select(
            'cities.name',
            DB::raw('COUNT(sales.id) as unpaid_count')
        )
            ->join('cities', 'sales.city_id', '=', 'cities.id')
            ->join('sales_outstandings', 'sales.id', '=', 'sales_outstandings.sale_id')
            ->whereNull('sales.is_return')
            ->where('sales_outstandings.outstanding_amount', '>', 0)
            ->groupBy('cities.id', 'cities.name')
            ->orderByDesc('unpaid_count')
            ->limit(10)
            ->get();

        $cityStats = $cityQuery->map(function ($item) {
            return [
                'city_id' => $item->city_id ?? 0,
                'city_name' => $item->name,
                'unpaid_count' => $item->unpaid_count,
            ];
        })->toArray();

        // Calculate percentages for cities
        $totalUnpaidCityCards = array_sum(array_column($cityStats, 'unpaid_count'));
        foreach ($cityStats as &$stat) {
            $stat['percentage'] = $totalUnpaidCityCards > 0 ? round(($stat['unpaid_count'] / $totalUnpaidCityCards) * 100, 2) : 0;
        }

        return Inertia::render('Collector/CardStatistics', [
            'statistics' => [
                'total' => [
                    'unpaid_cards' => $unpaidCards,
                    'unpaid_percentage' => $unpaidPercentage,
                ],
                'per_seller' => array_values($sellerStats),
                'top_subdistricts' => array_values($subdistrictStats),
                'top_cities' => array_values($cityStats),
            ]
        ]);
    }

    public function data(Request $request)
    {
        // Default to all time if no date filters are provided
        if (!$request->filled('startDate') && !$request->filled('endDate') && !$request->filled('all_time')) {
            $request->merge([
                'all_time' => true,
            ]);
        }

        // Default to unpaid status if no status filter is provided
        if (!$request->filled('status')) {
            $request->merge(['status' => 'unpaid']);
        }

        // Create base query for filtering
        $baseQuery = Sales::with(['items', 'installments.collector', 'outstanding', 'seller', 'city', 'subdistrict'])
            ->select([
                'sales.*',
                DB::raw('(sales.price - COALESCE(SUM(sales_installments.installment_amount), 0)) as remaining_amount')
            ])
            ->leftJoin('sales_installments', 'sales.id', '=', 'sales_installments.sale_id')
            ->groupBy('sales.id');

        // Apply all filters to base query
        $this->applyFilters($baseQuery, $request);

        // Create separate query for statistics (without groupBy)
        $statsQuery = Sales::with(['items', 'installments.collector', 'outstanding', 'seller', 'city', 'subdistrict'])
            ->select([
                'sales.*',
                DB::raw('(sales.price - COALESCE(SUM(sales_installments.installment_amount), 0)) as remaining_amount')
            ])
            ->leftJoin('sales_installments', 'sales.id', '=', 'sales_installments.sale_id')
            ->groupBy('sales.id');

        // Apply same filters to stats query
        $this->applyFilters($statsQuery, $request);

        // Calculate statistics based on filters
        $totalSales = $statsQuery->count();
        $totalAmount = $statsQuery->sum('sales.price');
        $paidSales = $statsQuery->havingRaw('remaining_amount <= 0')->count();
        $unpaidSales = $statsQuery->havingRaw('remaining_amount > 0')->count();
        $totalRemaining = $statsQuery->havingRaw('remaining_amount > 0')->sum('remaining_amount');
        
        // Calculate total data items (count of all items across filtered sales)
        $totalDataItems = SalesItem::whereHas('sale', function ($query) use ($request) {
            $query->whereNull('is_return');
            $this->applyFilters($query, $request);
        })->count();

        // Get sellers for filter dropdown
        $sellers = User::where('role', 'SALES')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Pagination for display data
        $sales = $baseQuery->orderBy('sales.transaction_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Collector/Data', [
            'sales' => $sales,
            'sellers' => $sellers,
            'filters' => $request->only(['search', 'payment_type', 'seller_id', 'province_id', 'city_id', 'subdistrict_id', 'village_id', 'status', 'startDate', 'endDate']),
            'statistics' => [
                'total_sales' => $totalSales,
                'total_amount' => $totalAmount,
                'paid_sales' => $paidSales,
                'unpaid_sales' => $unpaidSales,
                'total_remaining' => $totalRemaining,
                'total_data_items' => $totalDataItems,
                'paid_percentage' => $totalSales > 0 ? round(($paidSales / $totalSales) * 100, 2) : 0,
                'unpaid_percentage' => $totalSales > 0 ? round(($unpaidSales / $totalSales) * 100, 2) : 0,
            ]
        ]);
    }

    private function applyFilters($query, Request $request)
    {
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
            $query->where('sales.status', $request->status);
        }

        // Filter berdasarkan rentang tanggal
        if ($request->filled('startDate')) {
            try {
                $startDate = Carbon::parse($request->startDate)->startOfDay();
                $query->where('sales.transaction_at', '>=', $startDate);
            } catch (\Exception $e) {
                // Invalid date format, skip filter
            }
        }

        if ($request->filled('endDate')) {
            try {
                $endDate = Carbon::parse($request->endDate)->endOfDay();
                $query->where('sales.transaction_at', '<=', $endDate);
            } catch (\Exception $e) {
                // Invalid date format, skip filter
            }
        }

        // Search - mencari di semua kolom sales table tanpa batasan LIKE
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
                    })
                    ->orWhereHas('village', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }
    }
}
