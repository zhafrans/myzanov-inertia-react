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
}
