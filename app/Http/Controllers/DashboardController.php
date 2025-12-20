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
        // Total Tanggungan (outstanding amount dari semua sales)
        $totalTanggungan = SalesOutstanding::sum('outstanding_amount');

        // Total Terjual (total quantity dari semua sales items)
        $totalTerjual = SalesItem::sum('quantity');

        // Belum Lunas (sales dengan outstanding > 0)
        $belumLunas = Sales::whereHas('outstanding', function ($query) {
            $query->where('outstanding_amount', '>', 0);
        })->count();

        // Sudah Lunas (sales dengan outstanding <= 0)
        $sudahLunas = Sales::whereHas('outstanding', function ($query) {
            $query->where('outstanding_amount', '<=', 0);
        })->count();

        // Default: bulan ini
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        // 2. Monthly Sales Chart (Penjualan Per Bulan per Sales)
        $monthlySales = $this->getMonthlySalesData($startDate, $endDate);

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
    private function getMonthlySalesData($startDate, $endDate, $allTime = false)
    {
        // Ambil semua seller yang aktif
        $sellers = User::whereHas('sales')->get();

        // Array nama bulan singkat
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

        // Jika all time, ambil semua data dan group per bulan
        if ($allTime) {
            // Ambil range tanggal dari sales pertama sampai terakhir
            $firstSale = Sales::orderBy('transaction_at', 'asc')->first();
            $lastSale = Sales::orderBy('transaction_at', 'desc')->first();
            
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

        // Jika range <= 31 hari, gunakan per hari
        if ($daysDiff <= 31) {
            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                $dates[] = [
                    'start' => $currentDate->copy()->startOfDay(),
                    'end' => $currentDate->copy()->endOfDay()
                ];
                // Format: 01 Jan
                $day = $currentDate->format('d');
                $monthIndex = (int) $currentDate->format('n') - 1; // 0-11
                $dateLabels[] = $day . ' ' . $monthNames[$monthIndex];
                $currentDate->addDay();
            }
        }
        // Jika range > 31 hari tapi <= 93 hari (3 bulan), gunakan per minggu
        else if ($daysDiff <= 93) {
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
                // Format: 01 Jan - 07 Jan
                $startDay = $weekStart->format('d');
                $startMonthIndex = (int) $weekStart->format('n') - 1;
                $endDay = $weekEnd->format('d');
                $endMonthIndex = (int) $weekEnd->format('n') - 1;
                $dateLabels[] = $startDay . ' ' . $monthNames[$startMonthIndex] . ' - ' . $endDay . ' ' . $monthNames[$endMonthIndex];
                $currentDate->addWeek();
            }
        }
        // Jika range > 93 hari, gunakan per bulan
        else {
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
        }

        $series = [];

        foreach ($sellers as $seller) {
            $data = [];

            foreach ($dates as $dateRange) {
                $count = Sales::where('seller_id', $seller->id)
                    ->whereBetween('transaction_at', [$dateRange['start'], $dateRange['end']])
                    ->count();

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
    private function getSalesByUserData($startDate, $endDate, $allTime = false)
    {
        $query = Sales::select(
            'users.name',
            DB::raw('COUNT(sales.id) as total_sales')
        )
            ->join('users', 'sales.seller_id', '=', 'users.id');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
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
    private function getSalesByPaymentTypeData($startDate, $endDate, $allTime = false)
    {
        $query = Sales::select(
            'sales.payment_type as name',
            DB::raw('COUNT(sales.id) as total_sales')
        );

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }

        $salesByPaymentType = $query->groupBy('sales.payment_type')
            ->orderByDesc('total_sales')
            ->get();

        return [
            'labels' => $salesByPaymentType->pluck('name')->toArray(),
            'values' => $salesByPaymentType->pluck('total_sales')->toArray(),
        ];
    }

    /**
     * Get sales data by status (for pie chart)
     */
    private function getSalesByStatusData($startDate, $endDate, $allTime = false)
    {
        $query = Sales::select(
            'sales.status as name',
            DB::raw('COUNT(sales.id) as total_sales')
        );

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }

        $salesByStatus = $query->groupBy('sales.status')
            ->orderByDesc('total_sales')
            ->get();

        return [
            'labels' => $salesByStatus->pluck('name')->toArray(),
            'values' => $salesByStatus->pluck('total_sales')->toArray(),
        ];
    }

    /**
     * Get top product data
     */
    private function getTopProductData($startDate, $endDate, $allTime = false, $limit = 5)
    {
        $query = SalesItem::select(
            'sales_items.product_name as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->join('sales', 'sales_items.sale_id', '=', 'sales.id');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
        }

        $topProducts = $query->groupBy('sales_items.product_name')
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
    private function getTopSizeData($startDate, $endDate, $allTime = false, $limit = 5)
    {
        $query = SalesItem::select(
            'sales_items.size as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->join('sales', 'sales_items.sale_id', '=', 'sales.id')
            ->whereNotNull('sales_items.size')
            ->where('sales_items.size', '!=', '');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
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
    private function getTopColorData($startDate, $endDate, $allTime = false, $limit = 5)
    {
        $query = SalesItem::select(
            'sales_items.color as name',
            DB::raw('SUM(sales_items.quantity) as total')
        )
            ->join('sales', 'sales_items.sale_id', '=', 'sales.id')
            ->whereNotNull('sales_items.color')
            ->where('sales_items.color', '!=', '');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
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
    private function getTopCityData($startDate, $endDate, $allTime = false, $limit = 5)
    {
        $query = Sales::select(
            'cities.name',
            DB::raw('COUNT(sales.id) as total')
        )
            ->join('cities', 'sales.city_id', '=', 'cities.id')
            ->whereNotNull('city_id');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
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
    private function getTopSubdistrictData($startDate, $endDate, $allTime = false, $limit = 5)
    {
        $query = Sales::select(
            'subdistricts.name',
            DB::raw('COUNT(sales.id) as total')
        )
            ->join('subdistricts', 'sales.subdistrict_id', '=', 'subdistricts.id')
            ->whereNotNull('subdistrict_id');

        if (!$allTime && $startDate && $endDate) {
            $query->whereBetween('sales.transaction_at', [$startDate, $endDate]);
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

        $data = [
            'summary' => $this->getGlobalSummaryData(), // Global, tidak terpengaruh filter
            'monthlySales' => $this->getMonthlySalesData($startDate, $endDate, $allTime),
            'salesByUser' => $this->getSalesByUserData($startDate, $endDate, $allTime),
            'salesByPaymentType' => $this->getSalesByPaymentTypeData($startDate, $endDate, $allTime),
            'salesByStatus' => $this->getSalesByStatusData($startDate, $endDate, $allTime),
            'topProduct' => $this->getTopProductData($startDate, $endDate, $allTime, $topProductLimit),
            'topSize' => $this->getTopSizeData($startDate, $endDate, $allTime, $topSizeLimit),
            'topColor' => $this->getTopColorData($startDate, $endDate, $allTime, $topColorLimit),
            'topCity' => $this->getTopCityData($startDate, $endDate, $allTime, $topCityLimit),
            'topSubdistrict' => $this->getTopSubdistrictData($startDate, $endDate, $allTime, $topSubdistrictLimit),
        ];

        return response()->json($data);
    }

    /**
     * Get global summary data (tidak terpengaruh filter)
     */
    private function getGlobalSummaryData()
    {
        // Total Tanggungan (outstanding amount dari semua sales)
        $totalTanggungan = SalesOutstanding::sum('outstanding_amount');

        // Total Terjual (total quantity dari semua sales items)
        $totalTerjual = SalesItem::sum('quantity');

        // Belum Lunas (sales dengan outstanding > 0)
        $belumLunas = Sales::whereHas('outstanding', function ($query) {
            $query->where('outstanding_amount', '>', 0);
        })->count();

        // Sudah Lunas (sales dengan outstanding <= 0)
        $sudahLunas = Sales::whereHas('outstanding', function ($query) {
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
        $query = Sales::query();

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
        $years = Sales::selectRaw('YEAR(transaction_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json($years);
    }
}
