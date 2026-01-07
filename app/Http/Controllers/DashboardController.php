<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use App\Models\SalesItem;
use App\Models\SalesOutstanding;
use App\Models\SalesInstallment;
use App\Models\User;
use App\Models\City;
use App\Models\Subdistrict;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Ambil tahun dan bulan saat ini untuk filter
        $currentYear = now()->year;
        $currentMonth = now()->month;
        $startOfYear = now()->startOfYear();
        $endOfYear = now()->endOfYear();

        // 1. Summary Cards
        // Total Tanggungan (outstanding amount dari semua sales yang bukan returned)
        $totalTanggungan = Sales::whereNull('is_return')
            ->whereHas('outstanding')
            ->join('sales_outstandings', 'sales.id', '=', 'sales_outstandings.sale_id')
            ->sum('sales_outstandings.outstanding_amount');

        // Total Terjual (total quantity dari semua sales items yang bukan returned)
        $totalTerjual = Sales::whereNull('is_return')
            ->join('sales_items', 'sales.id', '=', 'sales_items.sale_id')
            ->sum('sales_items.quantity');

        // Belum Lunas (sales dengan outstanding > 0 yang bukan returned)
        $belumLunas = Sales::whereNull('is_return')
            ->whereHas('outstanding', function ($query) {
                $query->where('outstanding_amount', '>', 0);
            })->count();

        // Sudah Lunas (sales dengan outstanding <= 0 yang bukan returned)
        $sudahLunas = Sales::whereNull('is_return')
            ->whereHas('outstanding', function ($query) {
                $query->where('outstanding_amount', '<=', 0);
            })->count();

        // Default: bulan ini
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        // 2. Monthly Sales Chart (Penjualan Per Bulan per Sales)
        $monthlySales = $this->getMonthlySalesData($startDate, $endDate);

        // Total quantity sales bulan ini
        $totalMonthlyQuantity = Sales::whereNull('is_return')
            ->whereBetween('transaction_at', [$startDate, $endDate])
            ->join('sales_items', 'sales.id', '=', 'sales_items.sale_id')
            ->sum('sales_items.quantity');

        // 3. Sales by User (Pie Chart)
        $salesByUser = $this->getSalesByUserData($startDate, $endDate);

        // 4. Top Products (default limit 5)
        $topProduct = $this->getTopProductData($startDate, $endDate, false, 5);

        // 5. Top Size (default limit 5)
        $topSize = $this->getTopSizeData($startDate, $endDate, false, 5);

        // 6. Top Color (default limit 5)
        $topColor = $this->getTopColorData($startDate, $endDate, false, 5);

        // 7. Top City (default limit 5)
        $topCity = $this->getTopCityData($startDate, $endDate, false, 5);

        // 8. Top Subdistrict (default limit 5)
        $topSubdistrict = $this->getTopSubdistrictData($startDate, $endDate, false, 5);

        // 9. Sales by Payment Type (Pie Chart)
        $salesByPaymentType = $this->getSalesByPaymentTypeData($startDate, $endDate);

        // 10. Sales by Status (Pie Chart)
        $salesByStatus = $this->getSalesByStatusData($startDate, $endDate);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalTanggungan' => 'Rp ' . number_format($totalTanggungan, 0, ',', '.'),
                'totalTerjual' => $totalTerjual,
                'belumLunas' => $belumLunas,
                'sudahLunas' => $sudahLunas,
                'monthlySales' => $monthlySales,
                'totalMonthlyQuantity' => $totalMonthlyQuantity,
                'salesByUser' => $salesByUser,
                'salesByPaymentType' => $salesByPaymentType,
                'salesByStatus' => $salesByStatus,
                'topProduct' => $topProduct,
                'topSize' => $topSize,
                'topColor' => $topColor,
                'topCity' => $topCity,
                'topSubdistrict' => $topSubdistrict,
            ]
        ]);
    }

    /**
     * Get monthly sales data per seller berdasarkan date range
     */
    private function getMonthlySalesData($startDate, $endDate, $allTime = false, $paymentStatus = null)
    {
        // Ambil semua seller yang aktif (exclude returned sales)
        $sellers = User::whereHas('sales', function ($query) {
            $query->whereNull('is_return');
        })->get();

        // Array nama bulan singkat
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

        // Jika all time, ambil semua data dan group per bulan
        if ($allTime) {
            // Ambil range tanggal dari sales pertama sampai terakhir (exclude returned)
            $firstSale = Sales::whereNull('is_return')->orderBy('transaction_at', 'asc')->first();
            $lastSale = Sales::whereNull('is_return')->orderBy('transaction_at', 'desc')->first();
            
            if (!$firstSale || !$lastSale) {
                return [
                    'months' => [],
                    'series' => [],
                ];
            }

            $startDate = Carbon::parse($firstSale->transaction_at)->startOfMonth();
            $endDate = Carbon::parse($lastSale->transaction_at)->endOfMonth();
        }

        // Hitung jumlah hari dalam range
        $daysDiff = $startDate->diffInDays($endDate) + 1;

        $dates = [];
        $dateLabels = [];

        // Selalu gunakan per bulan sebagai scope terkecil
        $currentDate = $startDate->copy()->startOfMonth();
        while ($currentDate->lte($endDate)) {
            $monthStart = $currentDate->copy()->startOfMonth();
            $monthEnd = $currentDate->copy()->endOfMonth();
            
            // Adjust jika di luar range
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
            // Format: Jan 2025
            $monthIndex = (int) $currentDate->format('n') - 1; // 0-11
            $year = $currentDate->format('Y');
            $dateLabels[] = $monthNames[$monthIndex] . ' ' . $year;
            $currentDate->addMonth();
        }

        $series = [];

        foreach ($sellers as $seller) {
            $data = [];

            foreach ($dates as $dateRange) {
                $query = Sales::where('seller_id', $seller->id)
                    ->whereNull('is_return')
                    ->whereBetween('transaction_at', [$dateRange['start'], $dateRange['end']]);
                
                // Apply payment status filter if specified
                if ($paymentStatus === 'paid') {
                    $query->whereHas('outstanding', function ($q) {
                        $q->where('outstanding_amount', '<=', 0);
                    });
                } elseif ($paymentStatus === 'unpaid') {
                    $query->whereHas('outstanding', function ($q) {
                        $q->where('outstanding_amount', '>', 0);
                    });
                }

                $count = $query->count();
                $data[] = $count;
            }

            $series[] = [
                'name' => $seller->name,
                'data' => $data,
            ];
        }

        return [
            'months' => $dateLabels,
            'series' => $series,
        ];
    }

    /**
     * Get sales data by user (for pie chart)
     */
    private function getSalesByUserData($startDate, $endDate, $allTime = false, $paymentStatus = null)
    {
        $query = Sales::select(
            'users.name',
            DB::raw('COUNT(sales.id) as total_sales')
        )
            ->whereNull('is_return')
            ->join('users', 'sales.seller_id', '=', 'users.id');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

        $salesByUser = $query->groupBy('users.id', 'users.name')
            ->orderByDesc('total_sales')
            ->get();

        return [
            'labels' => $salesByUser->pluck('name')->toArray(),
            'values' => $salesByUser->pluck('total_sales')->toArray(),
        ];
    }

    /**
     * Get sales data by payment type (for pie chart)
     */
    private function getSalesByPaymentTypeData($startDate, $endDate, $allTime = false, $paymentStatus = null)
    {
        $query = Sales::select(
            'payment_type',
            DB::raw('COUNT(id) as total')
        )
            ->whereNull('is_return');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('transaction_at', [$startDate, $endDate]);
        }
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

    $salesByPaymentType = $query->groupBy('payment_type')
        ->orderByDesc('total')
        ->get();

    return [
        'labels' => $salesByPaymentType->pluck('payment_type')->toArray(),
        'values' => $salesByPaymentType->pluck('total')->toArray(),
    ];
}

/**
 * Get sales data by status (for pie chart)
 */
private function getSalesByStatusData($startDate, $endDate, $allTime = false, $paymentStatus = null)
{
    $query = Sales::select(
        'status',
        DB::raw('COUNT(id) as total')
    )
        ->whereNull('is_return');

    if (!$allTime && $startDate && $endDate) {
        $query->whereBetween('transaction_at', [$startDate, $endDate]);
    }
    
    // Apply payment status filter if specified
    if ($paymentStatus === 'paid') {
        $query->where('status', 'paid');
    } elseif ($paymentStatus === 'unpaid') {
        $query->where('status', 'unpaid');
    }

    $salesByStatus = $query->groupBy('status')
        ->orderByDesc('total')
        ->get();

    return [
        'labels' => $salesByStatus->pluck('status')->toArray(),
        'values' => $salesByStatus->pluck('total')->toArray(),
    ];
}

/**
 * Get top product data
 */
private function getTopProductData($startDate, $endDate, $allTime = false, $limit = 5, $paymentStatus = null)
{
    $query = SalesItem::select(
        'product_name as name',
        DB::raw('SUM(quantity) as total')
    )
        ->join('sales', 'sales_items.sale_id', '=', 'sales.id')
        ->whereNull('sales.is_return');

    if (!$allTime && $startDate && $endDate) {
        $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
    }
    
    // Apply payment status filter if specified
    if ($paymentStatus === 'paid') {
        $query->whereHas('sale.outstanding', function ($q) {
            $q->where('outstanding_amount', '<=', 0);
        });
    } elseif ($paymentStatus === 'unpaid') {
        $query->whereHas('sale.outstanding', function ($q) {
            $q->where('outstanding_amount', '>', 0);
        });
    }

    $topProducts = $query->groupBy('product_name')
        ->orderByDesc('total')
        ->limit($limit)
        ->get();

    return $topProducts->map(function ($item) {
        return [
            'name' => $item->name,
            'total' => (int) $item->total
        ];
    })->toArray();
    }

    /**
     * Get top size data
     */
    private function getTopSizeData($startDate, $endDate, $allTime = false, $limit = 5, $paymentStatus = null)
    {
        $query = SalesItem::select(
            'sales_items.size as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->join('sales', 'sales_items.sale_id', '=', 'sales.id')
            ->whereNull('sales.is_return');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $query->whereHas('sale.outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $query->whereHas('sale.outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

        $topSizes = $query->groupBy('sales_items.size')
            ->orderByDesc('total')
            ->limit($limit)
            ->get();

        return $topSizes->map(function ($item) {
            return [
                'name' => $item->name,
                'total' => (int) $item->total
            ];
        })->toArray();
    }

    /**
     * Get top color data
     */
    private function getTopColorData($startDate, $endDate, $allTime = false, $limit = 5, $paymentStatus = null)
    {
        $query = SalesItem::select(
            'sales_items.color as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->join('sales', 'sales_items.sale_id', '=', 'sales.id')
            ->whereNull('sales.is_return');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $query->whereHas('sale.outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $query->whereHas('sale.outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

        $topColors = $query->groupBy('sales_items.color')
            ->orderByDesc('total')
            ->limit($limit)
            ->get();

        return $topColors->map(function ($item) {
            return [
                'name' => $item->name,
                'total' => (int) $item->total
            ];
        })->toArray();
    }

    /**
     * Get top city data
     */
    private function getTopCityData($startDate, $endDate, $allTime = false, $limit = 5, $paymentStatus = null)
    {
        $query = Sales::select(
            'cities.name',
            DB::raw('COUNT(sales.id) as total')
        )
            ->join('cities', 'sales.city_id', '=', 'cities.id')
            ->whereNull('sales.is_return');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

        $topCities = $query->groupBy('cities.id', 'cities.name')
            ->orderByDesc('total')
            ->limit($limit)
            ->get();

        return $topCities->map(function ($item) {
            return [
                'name' => $item->name,
                'total' => (int) $item->total
            ];
        })->toArray();
    }

    /**
     * Get top subdistrict data
     */
    private function getTopSubdistrictData($startDate, $endDate, $allTime = false, $limit = 5, $paymentStatus = null)
    {
        $query = Sales::select(
            'subdistricts.name',
            DB::raw('COUNT(sales.id) as total')
        )
            ->join('subdistricts', 'sales.subdistrict_id', '=', 'subdistricts.id')
            ->whereNull('sales.is_return');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $query->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

        $topSubdistricts = $query->groupBy('subdistricts.id', 'subdistricts.name')
            ->orderByDesc('total')
            ->limit($limit)
            ->get();

        return $topSubdistricts->map(function ($item) {
            return [
                'name' => $item->name,
                'total' => (int) $item->total
            ];
        })->toArray();
    }

    /**
     * API endpoint untuk mengambil data dashboard dengan filter
     */
    public function getDashboardData(Request $request)
    {
        $allTime = $request->input('all_time', false);
        $paymentStatus = $request->input('payment_status'); // paid, unpaid, or null for all
        
        $startDate = null;
        $endDate = null;

        if (!$allTime) {
            // Default: bulan ini (tanggal awal bulan - tanggal akhir bulan)
            $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

            // Validasi dan parse tanggal
            try {
                $startDate = Carbon::parse($startDate)->startOfDay();
                $endDate = Carbon::parse($endDate)->endOfDay();
            } catch (\Exception $e) {
                $startDate = now()->startOfMonth()->startOfDay();
                $endDate = now()->endOfMonth()->endOfDay();
            }
        }

        // Ambil limit untuk setiap top card (default 5)
        $topProductLimit = (int) $request->input('top_product_limit', 5);
        $topSizeLimit = (int) $request->input('top_size_limit', 5);
        $topColorLimit = (int) $request->input('top_color_limit', 5);
        $topCityLimit = (int) $request->input('top_city_limit', 5);
        $topSubdistrictLimit = (int) $request->input('top_subdistrict_limit', 5);

        // Calculate total monthly quantity
        $totalMonthlyQuantity = 0;
        if (!$allTime && $startDate && $endDate) {
            $totalMonthlyQuantity = Sales::whereNull('is_return')
                ->whereBetween('transaction_at', [$startDate, $endDate])
                ->join('sales_items', 'sales.id', '=', 'sales_items.sale_id')
                ->sum('sales_items.quantity');
        }

        $data = [
            'summary' => $this->getGlobalSummaryData($paymentStatus), // Global, tidak terpengaruh filter
            'monthlySales' => $this->getMonthlySalesData($startDate, $endDate, $allTime, $paymentStatus),
            'totalMonthlyQuantity' => $totalMonthlyQuantity,
            'salesByUser' => $this->getSalesByUserData($startDate, $endDate, $allTime, $paymentStatus),
            'salesByPaymentType' => $this->getSalesByPaymentTypeData($startDate, $endDate, $allTime, $paymentStatus),
            'salesByStatus' => $this->getSalesByStatusData($startDate, $endDate, $allTime, $paymentStatus),
            'topProduct' => $this->getTopProductData($startDate, $endDate, $allTime, $topProductLimit, $paymentStatus),
            'topSize' => $this->getTopSizeData($startDate, $endDate, $allTime, $topSizeLimit, $paymentStatus),
            'topColor' => $this->getTopColorData($startDate, $endDate, $allTime, $topColorLimit, $paymentStatus),
            'topCity' => $this->getTopCityData($startDate, $endDate, $allTime, $topCityLimit, $paymentStatus),
            'topSubdistrict' => $this->getTopSubdistrictData($startDate, $endDate, $allTime, $topSubdistrictLimit, $paymentStatus),
        ];

        return response()->json($data);
    }

    /**
     * Get global summary data (tidak terpengaruh filter)
     */
    private function getGlobalSummaryData($paymentStatus = null)
    {
        // Base queries dengan filter is_return
        $outstandingQuery = SalesOutstanding::query()
            ->whereHas('sale', function ($query) {
                $query->whereNull('is_return');
            });
        $itemQuery = SalesItem::query()
            ->whereHas('sale', function ($query) {
                $query->whereNull('is_return');
            });
        $unpaidQuery = Sales::query()->whereNull('is_return');
        $paidQuery = Sales::query()->whereNull('is_return');
        
        // Apply payment status filter if specified
        if ($paymentStatus === 'paid') {
            $outstandingQuery->where('outstanding_amount', '<=', 0);
            $itemQuery->whereHas('sale.outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
            $unpaidQuery->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
            $paidQuery->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '<=', 0);
            });
        } elseif ($paymentStatus === 'unpaid') {
            $outstandingQuery->where('outstanding_amount', '>', 0);
            $itemQuery->whereHas('sale.outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
            $unpaidQuery->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
            $paidQuery->whereHas('outstanding', function ($q) {
                $q->where('outstanding_amount', '>', 0);
            });
        }

        // Total Tanggungan (outstanding amount dari semua sales)
        $totalTanggungan = $outstandingQuery->sum('outstanding_amount');

        // Total Terjual (total quantity dari semua sales items)
        $totalTerjual = $itemQuery->sum('quantity');

        // Belum Lunas (sales dengan outstanding > 0)
        $belumLunas = $unpaidQuery->whereHas('outstanding', function ($query) {
            $query->where('outstanding_amount', '>', 0);
        })->count();

        // Sudah Lunas (sales dengan outstanding <= 0)
        $sudahLunas = $paidQuery->whereHas('outstanding', function ($query) {
            $query->where('outstanding_amount', '<=', 0);
        })->count();

        return [
            'totalTanggungan' => 'Rp ' . number_format($totalTanggungan, 0, ',', '.'),
            'totalTerjual' => $totalTerjual,
            'belumLunas' => $belumLunas,
            'sudahLunas' => $sudahLunas,
        ];
    }

    /**
     * Get summary data with filters (tidak digunakan untuk 4 card utama)
     */
    private function getSummaryData($year, $month = null)
    {
        $query = Sales::query()->whereNull('is_return');

        if ($year) {
            $query->whereYear('transaction_at', $year);
        }

        if ($month) {
            $query->whereMonth('transaction_at', $month);
        }

        $salesIds = $query->pluck('id');

        $totalTanggungan = SalesOutstanding::whereIn('sale_id', $salesIds)
            ->sum('outstanding_amount');

        $totalTerjual = SalesItem::whereIn('sale_id', $salesIds)
            ->sum('quantity');

        $belumLunas = SalesOutstanding::whereIn('sale_id', $salesIds)
            ->where('outstanding_amount', '>', 0)
            ->count();

        $sudahLunas = SalesOutstanding::whereIn('sale_id', $salesIds)
            ->where('outstanding_amount', '<=', 0)
            ->count();

        return [
            'totalTanggungan' => 'Rp ' . number_format($totalTanggungan, 0, ',', '.'),
            'totalTerjual' => $totalTerjual,
            'belumLunas' => $belumLunas,
            'sudahLunas' => $sudahLunas,
        ];
    }

    /**
     * Get year filter options
     */
    public function getYearOptions()
    {
        $years = Sales::whereNull('is_return')
            ->selectRaw('YEAR(transaction_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json($years);
    }

    /**
     * API endpoint untuk mengambil data top card individual
     */
    public function getTopCardData(Request $request, $cardType)
    {
        $allTime = $request->input('all_time', false);
        $paymentStatus = $request->input('payment_status'); // paid, unpaid, or null for all
        
        $startDate = null;
        $endDate = null;

        if (!$allTime) {
            $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

            try {
                $startDate = Carbon::parse($startDate)->startOfDay();
                $endDate = Carbon::parse($endDate)->endOfDay();
            } catch (\Exception $e) {
                $startDate = now()->startOfMonth()->startOfDay();
                $endDate = now()->endOfMonth()->endOfDay();
            }
        }

        $limit = (int) $request->input('limit', 5);

        $data = null;

        switch ($cardType) {
            case 'top-product':
                $data = $this->getTopProductData($startDate, $endDate, $allTime, $limit, $paymentStatus);
                break;
            case 'top-size':
                $data = $this->getTopSizeData($startDate, $endDate, $allTime, $limit, $paymentStatus);
                break;
            case 'top-color':
                $data = $this->getTopColorData($startDate, $endDate, $allTime, $limit, $paymentStatus);
                break;
            case 'top-city':
                $data = $this->getTopCityData($startDate, $endDate, $allTime, $limit, $paymentStatus);
                break;
            case 'top-subdistrict':
                $data = $this->getTopSubdistrictData($startDate, $endDate, $allTime, $limit, $paymentStatus);
                break;
            default:
                return response()->json(['error' => 'Invalid card type'], 400);
        }

        return response()->json($data);
    }
}
