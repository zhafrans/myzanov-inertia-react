<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsappApiService;
use App\Services\OpenRouterService;
use App\Models\Sales;
use App\Models\WaSchedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class RunWaWeekly extends Command
{
    protected $signature = 'wa:run-weekly';
    protected $description = 'Run weekly WhatsApp report based on schedule from wa_schedulers table';

    protected WhatsappApiService $waService;
    protected OpenRouterService $openRouterService;
    protected Carbon $date;

    public function __construct(WhatsappApiService $waService, OpenRouterService $openRouterService)
    {
        parent::__construct();
        $this->waService = $waService;
        $this->openRouterService = $openRouterService;
    }

    public function handle()
    {
        try {
            // Get weekly schedule from database
            $schedule = WaSchedule::where('type', 'weekly')->first();
            
            if (!$schedule) {
                $this->error('Jadwal mingguan tidak ditemukan di database');
                return 1;
            }

            if ($schedule->weekly_day === null || $schedule->weekly_day === '' || !$schedule->weekly_at) {
                $this->error('Hari atau waktu pengiriman mingguan tidak diatur');
                return 1;
            }

            // Carbon format: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
            $currentDay = Carbon::now()->dayOfWeek; // 0 (Sunday) to 6 (Saturday)
            $scheduledDay = $schedule->weekly_day; // 0-6 format from database (Carbon format)
            
            $currentTime = Carbon::now()->format('H:i');
            $scheduledTime = Carbon::parse($schedule->weekly_at)->format('H:i');

            // Check if current day matches scheduled day
            if ($currentDay != $scheduledDay) {
                $this->info("Belum hari pengiriman. Current: {$currentDay}, Scheduled: {$scheduledDay}");
                return 0;
            }

            // Check if current time matches scheduled time (with 5 minute tolerance)
            $current = Carbon::parse($currentTime);
            $scheduled = Carbon::parse($scheduledTime);
            
            $diffInMinutes = abs($current->diffInMinutes($scheduled));
            
            if ($diffInMinutes > 5) {
                $this->info("Belum waktu pengiriman. Current: {$currentTime}, Scheduled: {$scheduledTime}");
                return 0;
            }

            $this->info("Waktu pengiriman mingguan tercapai. Memulai proses...");
            
            return $this->handleWeekly();
            
        } catch (\Exception $e) {
            Log::error('RunWaWeekly handle error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Handle weekly report (minggu kemarin, semua sales termasuk Umi)
     */
    private function handleWeekly()
    {
        try {
            // Set tanggal hari ini
            $today = Carbon::today();
            // $today = Carbon::create(2025, 12, 10);

            // Hitung minggu kemarin (Senin - Sabtu minggu lalu)
            $lastWeekStart = $today->copy()->subWeek()->startOfWeek(Carbon::MONDAY); // Senin minggu lalu
            $lastWeekEnd = $today->copy()->subWeek()->startOfWeek(Carbon::MONDAY)->addDays(5); // Sabtu minggu lalu

            $sales = Sales::with([
                'items',
                'installments',
                'outstanding',
                'seller',
                'user',
                'province',
                'city',
                'subdistrict',
                'village'
            ])
            ->whereBetween('transaction_at', [
                $lastWeekStart->format('Y-m-d'),
                $lastWeekEnd->format('Y-m-d')
            ])
            ->get();

            if ($sales->isEmpty()) {
                $this->info("Tidak ada data penjualan untuk minggu lalu ({$lastWeekStart->format('Y-m-d')} - {$lastWeekEnd->format('Y-m-d')}).");
                return 0;
            }

            $weekFormatted = $lastWeekStart->locale('id')->isoFormat('D MMMM') . ' - ' . $lastWeekEnd->locale('id')->isoFormat('D MMMM YYYY');
            $message = "📊 Data Penjualan Minggu Lalu ($weekFormatted):\n\n";
            $aiContext = "";

            foreach ($sales as $sale) {
                // Alamat lengkap
                $addressParts = [];
                if ($sale->address) $addressParts[] = $sale->address;
                if ($sale->village) $addressParts[] = $sale->village->name;
                if ($sale->subdistrict) $addressParts[] = $sale->subdistrict->name;
                if ($sale->city) $addressParts[] = $sale->city->name;
                $fullAddress = implode(', ', $addressParts);

                // Build konteks untuk AI
                $aiContext .= "- Invoice: {$sale->invoice}, Customer: {$sale->customer_name}, Produk: " . $sale->items->pluck('product_name')->implode(', ') . " Seller: " . ($sale->seller->name ?? '-') . ", Alamat: $fullAddress\n";
            }

            // Dapatkan data summary mingguan
            $additionalContext = $this->getWeeklySummaryData($lastWeekStart, $lastWeekEnd);

            // Kirim summary data
            $weeklySummaryResponse = $this->weeklySummary($lastWeekStart, $lastWeekEnd);
            $this->info("Pesan wa mingguan terkirim: " . json_encode($weeklySummaryResponse));

            // Kirim summary penjualan menggunakan AI
            $question = 
                "Tolong buatkan ringkasan penjualan minggu lalu periode {$weekFormatted} (Senin-Sabtu) untuk dikirim ke grup WhatsApp rekan-rekan ZANOV Shoes Purwokerto.\n\n
                Ketentuan bahasa:\n
                - Gunakan bahasa indonesia non formal, santai, lucu.\n
                - Tulis seperti percakapan WhatsApp yang natural.\n\n
                Tugas:\n
                - Buat ringkasan jumlah total penjualan minggu lalu (Senin-Sabtu).\n
                - Sebutkan total pcs terjual dalam seminggu (6 hari kerja).\n
                - Sebutkan rata-rata jualan banyaknya di daerah mana (ambil dari data \"Alamat\").\n
                - Sebutkan produk/sepatu apa yang paling laris minggu lalu.\n
                - Sebutkan siapa yang penjualannya paling sedikit.\n
                - Sebutkan siapa yang penjualannya paling banyak.\n
                - Berikan apresiasi khusus untuk performa mingguan.\n
                - Jangan tampilkan detail per transaksi. Cukup ringkasan saja.\n\n
                Catatan penting:\n
                - Minggu lalu adalah hari Senin sampai Sabtu (6 hari kerja).\n
                - Jika satu kalimat yang mau di bold itu dibuka dan dibungkus tanda (*) satu kali saja, jangan sampai ke double.\n
                - Jika penjualan mingguan bagus, beri pujian yang antusias dan lucu.\n
                - Jika penjualan mingguan kurang, beri semangat untuk minggu depan dengan cara yang positif.\n
                - Gunakan istilah \"pcs\" bukan \"invoice\".\n
                - Buat kalimat yang natural, enak dibaca, tidak kaku.\n
                - Ini adalah laporan mingguan yang lebih komprehensif.\n\n
                Akhiri dengan:\n
                - Penutup yang memotivasi untuk minggu depan.\n
                - Target penjualan bulanan 150 pcs per sales, dan target total penjualan bulanan 600 pcs (tidak usah disebut/ditulis karena pasti semua sales tau, cukup anda saja yang tahu).\n
                - Target mingguan sekitar 37-38 pcs per sales (150/4 minggu).\n
                - Tambahkan awalan 'Mba' jika menyebut sales.\n
                - Berikan semangat untuk mencapai target bulanan.\n
                - Salam dari ZANOVIA, AI ne ZANOV Shoes Purwokerto.\n\n
                Berikut data penjualannya:\n
                {$aiContext}\n\n
                Data tambahan statistik per seller dan produk:\n
                {$additionalContext}";

            $summary = $this->openRouterService->chat($question);

            // Kirim summary via WA
            $responseSummary = $this->waService->sendGroup("📝 Ringkasan Penjualan Minggu Lalu $weekFormatted:\n\n" . $summary);
            $this->info("Pesan summary AI mingguan terkirim: " . json_encode($responseSummary));

            return 0;
        } catch (\Exception $e) {
            Log::error('RunWaWeekly handleWeekly error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => $this->date->format('Y-m-d') ?? null
            ]);
            $this->error('Terjadi kesalahan saat memproses laporan mingguan: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Ambil data summary mingguan untuk konteks AI (semua sales termasuk Umi)
     */
    private function getWeeklySummaryData($startDate, $endDate)
    {
        try {
            $startOfMonth = $startDate->copy()->startOfMonth();

        // Ambil penjualan minggu lalu per seller dengan jumlah quantity
        $weeklySales = Sales::with(['seller', 'items'])
            ->whereBetween('transaction_at', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->groupBy('seller_id')
            ->map(function ($sales) {
                $totalQuantity = $sales->sum(function ($sale) {
                    return $sale->items->sum('quantity');
                });
                
                return [
                    'seller' => $sales->first()->seller,
                    'total_quantity' => $totalQuantity,
                    'total_transactions' => $sales->count()
                ];
            });

        // Ambil akumulasi penjualan dari awal bulan hingga akhir minggu lalu per seller
        $monthlySales = Sales::with(['seller', 'items'])
            ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->groupBy('seller_id')
            ->map(function ($sales) {
                $totalQuantity = $sales->sum(function ($sale) {
                    return $sale->items->sum('quantity');
                });
                
                return [
                    'seller' => $sales->first()->seller,
                    'total_quantity' => $totalQuantity,
                    'total_transactions' => $sales->count()
                ];
            });

        // Gabungkan data weekly dan monthly
        $salesData = [];
        
        // Ambil semua seller dari weekly dan monthly
        $allSellerIds = $weeklySales->keys()->merge($monthlySales->keys())->unique();

        foreach ($allSellerIds as $sellerId) {
            $weekly = $weeklySales->get($sellerId);
            $monthly = $monthlySales->get($sellerId);
            
            $sellerName = $weekly['seller']->name ?? $monthly['seller']->name ?? 'Unknown';
            $monthlyQty = $monthly['total_quantity'] ?? 0;
            
            // Hitung jumlah hari seller berangkat (ada penjualan) bulan ini
            $daysWorked = Sales::where('seller_id', $sellerId)
                ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->selectRaw('COUNT(DISTINCT DATE(transaction_at)) as days_count')
                ->value('days_count');
            
            $averagePerDay = $daysWorked > 0 ? round($monthlyQty / $daysWorked, 1) : 0;
            
            $salesData[] = [
                'name' => $sellerName,
                'weekly_quantity' => $weekly['total_quantity'] ?? 0,
                'monthly_quantity' => $monthlyQty,
                'days_worked' => $daysWorked,
                'average_per_day' => $averagePerDay,
            ];
        }

        // Sort berdasarkan penjualan mingguan (terbanyak dulu)
        usort($salesData, function($a, $b) {
            return $b['weekly_quantity'] <=> $a['weekly_quantity'];
        });

        // Hitung produk terlaris minggu lalu
        $topProducts = Sales::with('items')
            ->whereBetween('transaction_at', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->flatMap(function ($sale) {
                return $sale->items;
            })
            ->groupBy('product_name')
            ->map(function ($items, $productName) {
                return [
                    'product_name' => $productName,
                    'total_quantity' => $items->sum('quantity'),
                    'total_sales' => $items->count()
                ];
            })
            ->sortByDesc('total_quantity')
            ->take(5);

        // Build konteks untuk AI
        $context = "Statistik Penjualan Per Seller (Minggu Lalu):\n";
        foreach ($salesData as $data) {
            $context .= "- {$data['name']}: Minggu lalu {$data['weekly_quantity']} pcs, Bulan ini {$data['monthly_quantity']} pcs, Rata-rata/hari {$data['average_per_day']} pcs ({$data['days_worked']} hari berangkat)\n";
        }

        // Total keseluruhan
        $totalWeeklyQuantity = collect($salesData)->sum('weekly_quantity');
        $totalMonthlyQuantity = collect($salesData)->sum('monthly_quantity');
        
        $context .= "\nTotal Keseluruhan:\n";
        $context .= "- Minggu lalu: {$totalWeeklyQuantity} pcs\n";
        $context .= "- Bulan ini: {$totalMonthlyQuantity} pcs\n";

        // Tambahkan info produk terlaris
        $context .= "\nProduk Terlaris Minggu Lalu:\n";
        foreach ($topProducts as $product) {
            $context .= "- {$product['product_name']}: {$product['total_quantity']} pcs (dari {$product['total_sales']} transaksi)\n";
        }

        return $context;
        } catch (\Exception $e) {
            Log::error('RunWaWeekly getWeeklySummaryData error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'start_date' => $startDate->format('Y-m-d') ?? null,
                'end_date' => $endDate->format('Y-m-d') ?? null
            ]);
            return "Error saat mengambil data summary mingguan: " . $e->getMessage();
        }
    }

    /**
     * Summary mingguan (semua sales termasuk Umi)
     */
    public function weeklySummary($startDate, $endDate)
    {
        try {
            $startOfMonth = $startDate->copy()->startOfMonth();
            $weekFormatted = $startDate->locale('id')->isoFormat('D MMMM') . ' - ' . $endDate->locale('id')->isoFormat('D MMMM YYYY');

        // Ambil penjualan minggu lalu (Senin-Sabtu) per seller (semua sales)
        $weeklySales = Sales::with(['seller', 'items'])
            ->whereBetween('transaction_at', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->groupBy('seller_id')
            ->map(function ($sales) {
                $totalQuantity = $sales->sum(function ($sale) {
                    return $sale->items->sum('quantity');
                });
                
                return [
                    'seller' => $sales->first()->seller,
                    'total_quantity' => $totalQuantity,
                    'total_transactions' => $sales->count()
                ];
            });

        // Ambil akumulasi penjualan bulan ini (semua sales)
        $monthlySales = Sales::with(['seller', 'items'])
            ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->groupBy('seller_id')
            ->map(function ($sales) {
                $totalQuantity = $sales->sum(function ($sale) {
                    return $sale->items->sum('quantity');
                });
                
                return [
                    'seller' => $sales->first()->seller,
                    'total_quantity' => $totalQuantity,
                    'total_transactions' => $sales->count()
                ];
            });

        if ($weeklySales->isEmpty() && $monthlySales->isEmpty()) {
            $this->info("Tidak ada data penjualan untuk minggu lalu ({$startDate->format('Y-m-d')} - {$endDate->format('Y-m-d')}).");
            return 0;
        }

        // Gabungkan data
        $salesData = [];
        $allSellerIds = $weeklySales->keys()->merge($monthlySales->keys())->unique();

        foreach ($allSellerIds as $sellerId) {
            $weekly = $weeklySales->get($sellerId);
            $monthly = $monthlySales->get($sellerId);
            
            $sellerName = $weekly['seller']->name ?? $monthly['seller']->name ?? 'Unknown';
            $monthlyQty = $monthly['total_quantity'] ?? 0;
            
            $daysWorked = Sales::where('seller_id', $sellerId)
                ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->selectRaw('COUNT(DISTINCT DATE(transaction_at)) as days_count')
                ->value('days_count');
            
            $averagePerDay = $daysWorked > 0 ? round($monthlyQty / $daysWorked, 1) : 0;
            
            $salesData[] = [
                'name' => $sellerName,
                'weekly_quantity' => $weekly['total_quantity'] ?? 0,
                'monthly_quantity' => $monthlyQty,
                'days_worked' => $daysWorked,
                'average_per_day' => $averagePerDay,
            ];
        }

        usort($salesData, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        // Build pesan WhatsApp
        $message = "📊 Laporan Penjualan Minggu Lalu $weekFormatted\n\n";

        foreach ($salesData as $data) {
            $message .= "👤 *{$data['name']}*\n";
            $message .= "📅 Minggu lalu: {$data['weekly_quantity']} pcs\n";
            $message .= "📆 Bulan Ini: {$data['monthly_quantity']} pcs\n";
            $message .= "📈 Rata-rata/hari: {$data['average_per_day']} pcs ({$data['days_worked']} hari berangkat)\n";
            $message .= "----------------------\n";
        }

        $totalWeeklyQuantity = collect($salesData)->sum('weekly_quantity');
        $totalMonthlyQuantity = collect($salesData)->sum('monthly_quantity');
        $totalDaysWorked = collect($salesData)->sum('days_worked');
        $totalAveragePerDay = $totalDaysWorked > 0 ? round($totalMonthlyQuantity / $totalDaysWorked, 1) : 0;

        $message .= "\n📊 *TOTAL*\n";
        $message .= "📅 Minggu lalu: {$totalWeeklyQuantity} pcs\n";
        $message .= "📆 Bulan Ini: {$totalMonthlyQuantity} pcs\n";
        $message .= "📈 Rata-rata/hari: {$totalAveragePerDay} pcs\n";

        $response = $this->waService->sendGroup($message);
        $this->info("Pesan terkirim: " . json_encode($response));

        return 0;
        } catch (\Exception $e) {
            Log::error('RunWaWeekly weeklySummary error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'start_date' => $startDate->format('Y-m-d') ?? null,
                'end_date' => $endDate->format('Y-m-d') ?? null
            ]);
            $this->error('Terjadi kesalahan saat mengirim summary mingguan: ' . $e->getMessage());
            return 1;
        }
    }
}
