<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use App\Models\SalesItem;
use App\Models\SalesOutstanding;
use App\Models\Subdistrict;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollectorController extends Controller
{
    public function cardStatistics()
    {
        // Get all sales items with their relationships
        $salesItems = SalesItem::with(['sale.outstanding', 'sale.seller', 'sale.subdistrict', 'sale.city'])
            ->whereHas('sale.outstanding')
            ->get();

        // Total statistics - only unpaid cards
        $totalCards = $salesItems->count();
        $unpaidCards = $salesItems->filter(function ($item) {
            return $item->sale->outstanding && $item->sale->outstanding->outstanding_amount > 0;
        })->count();
        $unpaidPercentage = $totalCards > 0 ? round(($unpaidCards / $totalCards) * 100, 2) : 0;

        // Statistics per seller - simplified approach
        $sellerStats = [];
        $sellerGroups = $salesItems->groupBy('sale.seller_id');
        
        foreach ($sellerGroups as $sellerId => $items) {
            $seller = $items->first()->sale->seller;
            $unpaid = $items->filter(function ($item) {
                return $item->sale->outstanding && $item->sale->outstanding->outstanding_amount > 0;
            })->count();
            
            $sellerStats[] = [
                'seller_id' => $sellerId,
                'seller_name' => $seller ? $seller->name : 'Unknown',
                'unpaid' => $unpaid,
                'unpaid_percentage' => $items->count() > 0 ? round(($unpaid / $items->count()) * 100, 2) : 0,
            ];
        }
        
        // Sort by seller name
        usort($sellerStats, function ($a, $b) {
            return strcmp($a['seller_name'], $b['seller_name']);
        });

        // Statistics per subdistrict (unpaid cards only)
        $subdistrictStats = [];
        $unpaidItems = $salesItems->filter(function ($item) {
            return $item->sale->outstanding && 
                   $item->sale->outstanding->outstanding_amount > 0 && 
                   $item->sale->subdistrict;
        });
        
        $subdistrictGroups = $unpaidItems->groupBy('sale.subdistrict_id');
        
        foreach ($subdistrictGroups as $subdistrictId => $items) {
            $subdistrict = $items->first()->sale->subdistrict;
            $city = $subdistrict ? $subdistrict->city : null;
            $count = $items->count();
            
            $subdistrictStats[] = [
                'subdistrict_id' => $subdistrictId,
                'subdistrict_name' => $subdistrict ? $subdistrict->name : 'Unknown',
                'city_name' => $city && isset($city->name) ? $city->name : 'Unknown',
                'unpaid_count' => $count,
            ];
        }
        
        // Sort by unpaid count descending and take top 10
        usort($subdistrictStats, function ($a, $b) {
            return $b['unpaid_count'] - $a['unpaid_count'];
        });
        $subdistrictStats = array_slice($subdistrictStats, 0, 10);

        // Calculate percentages for subdistricts
        $totalUnpaidCards = array_sum(array_column($subdistrictStats, 'unpaid_count'));
        foreach ($subdistrictStats as &$stat) {
            $stat['percentage'] = $totalUnpaidCards > 0 ? round(($stat['unpaid_count'] / $totalUnpaidCards) * 100, 2) : 0;
        }

        // Statistics per city (unpaid cards only)
        $cityStats = [];
        $unpaidCityItems = $salesItems->filter(function ($item) {
            return $item->sale->outstanding && 
                   $item->sale->outstanding->outstanding_amount > 0 && 
                   $item->sale->subdistrict && 
                   $item->sale->subdistrict->city;
        });
        
        $cityGroups = $unpaidCityItems->groupBy('sale.subdistrict.city_id');
        
        foreach ($cityGroups as $cityId => $items) {
            $city = $items->first()->sale->subdistrict->city;
            $count = $items->count();
            
            $cityStats[] = [
                'city_id' => $cityId,
                'city_name' => $city ? $city->name : 'Unknown',
                'unpaid_count' => $count,
            ];
        }
        
        // Sort by unpaid count descending and take top 10
        usort($cityStats, function ($a, $b) {
            return $b['unpaid_count'] - $a['unpaid_count'];
        });
        $cityStats = array_slice($cityStats, 0, 10);

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
