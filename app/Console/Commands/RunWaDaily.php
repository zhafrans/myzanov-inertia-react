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

class RunWaDaily extends Command
{
    protected $signature = 'wa:run-daily';
    protected $description = 'Run daily WhatsApp report based on schedule from wa_schedulers table';

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
            // Get daily schedule from database
            $schedule = WaSchedule::where('type', 'daily')->first();
            
            if (!$schedule) {
                $this->error('Jadwal harian tidak ditemukan di database');
                return 1;
            }

            if (!$schedule->daily_at) {
                $this->error('Waktu pengiriman harian tidak diatur');
                return 1;
            }

            $currentTime = Carbon::now()->format('H:i');
            $scheduledTime = Carbon::parse($schedule->daily_at)->format('H:i');

            // Check if current time matches scheduled time (with 5 minute tolerance)
            $currentMinutes = Carbon::now()->format('H:i');
            $scheduledMinutes = $schedule->daily_at;
            
            $current = Carbon::parse($currentMinutes);
            $scheduled = Carbon::parse($scheduledMinutes);
            
            $diffInMinutes = abs($current->diffInMinutes($scheduled));
            
            if ($diffInMinutes > 5) {
                $this->info("Belum waktu pengiriman. Current: {$currentMinutes}, Scheduled: {$scheduledMinutes}");
                return 0;
            }

            $this->info("Waktu pengiriman harian tercapai. Memulai proses...");
            
            return $this->handleDaily();
            
        } catch (\Exception $e) {
            Log::error('RunWaDaily handle error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Handle daily report (kemarin, exclude Umi)
     */
    private function handleDaily()
    {
        try {
            // Set tanggal kemarin
            // $this->date = Carbon::yesterday();
            $this->date = Carbon::create(2025, 12, 10);
            $date = $this->date;

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
            ->whereDate('transaction_at', $date->format('Y-m-d'))
            ->whereHas('seller', function($query) {
                $query->where('name', '!=', 'Umi')
                      ->orWhereNull('name');
            })
            ->get();

            if ($sales->isEmpty()) {
                $this->info("Tidak ada data penjualan untuk kemarin ({$date->format('Y-m-d')}).");
                return 0;
            }

            $yesterdayFormatted = $date->locale('id')->isoFormat('dddd, D MMMM YYYY');
            $message = "📊 Data Penjualan Kemarin Tanggal $yesterdayFormatted:\n\n";
            $aiContext = "";

            foreach ($sales as $sale) {
                // Alamat lengkap
                $addressParts = [];
                if ($sale->address) $addressParts[] = $sale->address;
                if ($sale->village) $addressParts[] = $sale->village->name;
                if ($sale->subdistrict) $addressParts[] = $sale->subdistrict->name;
                if ($sale->city) $addressParts[] = $sale->city->name;
                $fullAddress = implode(', ', $addressParts);

                // Build pesan untuk WhatsApp
                $message .= "- Invoice: {$sale->invoice}\n";
                $message .= "- Customer: {$sale->customer_name}\n";
                $message .= "- Produk: " . $sale->items->pluck('product_name')->implode(', ') . "\n";
                $message .= "- Harga: Rp " . number_format($sale->price, 0, ',', '.') . "\n";
                $message .= "- Seller: " . ($sale->seller->name ?? '-') . "\n";
                $message .= "🏠 Alamat: $fullAddress\n";
                $message .= "- Tipe Bayar: {$sale->payment_type}\n";
                $message .= "- Status: {$sale->status}\n";
                $message .= "----------------------\n";

                // Build konteks untuk AI
                $aiContext .= "- Invoice: {$sale->invoice}, Customer: {$sale->customer_name}, Produk: " . $sale->items->pluck('product_name')->implode(', ') . " Seller: " . ($sale->seller->name ?? '-') . ", Alamat: $fullAddress\n";
            }

            // Dapatkan data summary
            $additionalContext = $this->getYesterdaySummaryData($date);

            // Kirim summary data
            $yesterdaySummaryResponse = $this->yesterdaySummary();
            $this->info("Pesan wa terkirim: " . json_encode($yesterdaySummaryResponse));

            // Kirim summary penjualan menggunakan AI
            $question = 
                "Tolong buatkan ringkasan penjualan kemarin tanggal {$yesterdayFormatted} untuk dikirim ke grup WhatsApp rekan-rekan ZANOV Shoes Purwokerto.\n\n
                Ketentuan bahasa:\n
                - Gunakan bahasa indonesia non formal, santai, lucu.\n
                - Tulis seperti percakapan WhatsApp yang natural.\n\n
                Tugas:\n
                - Buat ringkasan jumlah total penjualan kemarin.\n
                - Sebutkan total pcs terjual (invoice diganti istilah \"pcs\").\n
                - Sebutkan rata-rata jualan banyaknya di daerah mana (ambil dari data \"Alamat\").\n
                - Sebutkan produk/sepatu apa yang paling laris kemarin.\n
                - Sebutkan siapa yang penjualannya paling sedikit.\n
                - Sebutkan siapa yang penjualannya paling banyak.\n
                - Jangan tampilkan detail per transaksi. Cukup ringkasan saja.\n\n
                Catatan penting:\n
                - Jika satu kalimat yang mau di bold itu dibuka dan dibungkus tanda (*) satu kali saja, jangan sampai ke double.\n
                - Jika penjualan sedikit, beri kalimat penyemangat yang lucu pakai bahasa indonesia non formal.\n
                - Jika penjualan bagus, beri pujian yang lucu pakai bahasa indonesia non formal.\n
                - Gunakan istilah \"pcs\" bukan \"invoice\".\n
                - Buat kalimat yang natural, enak dibaca, tidak kaku.\n\n
                Akhiri dengan:\n
                - Penutup yang sopan tapi santai.\n
                - Target penjualan bulanan 150 pcs per sales, dan target total penjualan bulanan 600 pcs (tidak usah disebut/ditulis karena pasti semua sales tau, cukup anda saja yang tahu).\n
                - Tambahkan awalan 'Mba' jika menyebut sales.\n
                - Jika ada sales yang jualan perhari kurang dari target, beri semangat tapi dengan bahasa yang lucu dan tidak menyinggung.\n
                - Salam dari ZANOVIA, AI ne ZANOV Shoes Purwokerto.\n\n
                Berikut data penjualannya:\n
                {$aiContext}\n\n
                Data tambahan statistik per seller dan produk:\n
                {$additionalContext}";

            $summary = $this->openRouterService->chat($question);

            // Kirim summary via WA
            $responseSummary = $this->waService->sendGroup("📝 Ringkasan Penjualan Kemarin $yesterdayFormatted:\n\n" . $summary);
            $this->info("Pesan summary AI terkirim: " . json_encode($responseSummary));

            return 0;
        } catch (\Exception $e) {
            Log::error('RunWaDaily handleDaily error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => $this->date->format('Y-m-d') ?? null
            ]);
            $this->error('Terjadi kesalahan saat memproses laporan harian: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Ambil data summary harian untuk konteks AI (exclude Umi)
     */
    private function getYesterdaySummaryData($date)
    {
        try {
            $startOfMonth = $date->copy()->startOfMonth();

        // Ambil penjualan kemarin per seller dengan jumlah quantity (exclude Umi)
        $dailySales = Sales::with(['seller', 'items'])
            ->whereDate('transaction_at', $date->format('Y-m-d'))
            ->whereHas('seller', function($query) {
                $query->where('name', '!=', 'Umi');
            })
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

        // Ambil akumulasi penjualan dari awal bulan hingga kemarin per seller (exclude Umi)
        $monthlySales = Sales::with(['seller', 'items'])
            ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $date->format('Y-m-d')])
            ->whereHas('seller', function($query) {
                $query->where('name', '!=', 'Umi');
            })
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

        // Gabungkan data daily dan monthly
        $salesData = [];
        
        // Ambil semua seller dari daily dan monthly
        $allSellerIds = $dailySales->keys()->merge($monthlySales->keys())->unique();

        foreach ($allSellerIds as $sellerId) {
            $daily = $dailySales->get($sellerId);
            $monthly = $monthlySales->get($sellerId);
            
            $sellerName = $daily['seller']->name ?? $monthly['seller']->name ?? 'Unknown';
            $monthlyQty = $monthly['total_quantity'] ?? 0;
            
            // Hitung jumlah hari seller berangkat (ada penjualan) bulan ini
            $daysWorked = Sales::where('seller_id', $sellerId)
                ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $date->format('Y-m-d')])
                ->selectRaw('COUNT(DISTINCT DATE(transaction_at)) as days_count')
                ->value('days_count');
            
            $averagePerDay = $daysWorked > 0 ? round($monthlyQty / $daysWorked, 1) : 0;
            
            $salesData[] = [
                'name' => $sellerName,
                'daily_quantity' => $daily['total_quantity'] ?? 0,
                'monthly_quantity' => $monthlyQty,
                'days_worked' => $daysWorked,
                'average_per_day' => $averagePerDay,
            ];
        }

        // Sort berdasarkan penjualan harian (terbanyak dulu)
        usort($salesData, function($a, $b) {
            return $b['daily_quantity'] <=> $a['daily_quantity'];
        });

        // Hitung produk terlaris kemarin
        $topProducts = Sales::with('items')
            ->whereDate('transaction_at', $date->format('Y-m-d'))
            ->whereHas('seller', function($query) {
                $query->where('name', '!=', 'Umi');
            })
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
        $context = "Statistik Penjualan Per Seller:\n";
        foreach ($salesData as $data) {
            $context .= "- {$data['name']}: Kemarin {$data['daily_quantity']} pcs, Bulan ini {$data['monthly_quantity']} pcs, Rata-rata/hari {$data['average_per_day']} pcs ({$data['days_worked']} hari berangkat)\n";
        }

        // Total keseluruhan
        $totalDailyQuantity = collect($salesData)->sum('daily_quantity');
        $totalMonthlyQuantity = collect($salesData)->sum('monthly_quantity');
        
        $context .= "\nTotal Keseluruhan:\n";
        $context .= "- Kemarin: {$totalDailyQuantity} pcs\n";
        $context .= "- Bulan ini: {$totalMonthlyQuantity} pcs\n";

        // Tambahkan info produk terlaris
        $context .= "\nProduk Terlaris Kemarin:\n";
        foreach ($topProducts as $product) {
            $context .= "- {$product['product_name']}: {$product['total_quantity']} pcs (dari {$product['total_sales']} transaksi)\n";
        }

        return $context;
        } catch (\Exception $e) {
            Log::error('RunWaDaily getYesterdaySummaryData error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => $date->format('Y-m-d') ?? null
            ]);
            return "Error saat mengambil data summary: " . $e->getMessage();
        }
    }

    /**
     * Summary harian (exclude Umi)
     */
    public function yesterdaySummary()
    {
        try {
            $date = $this->date ?? Carbon::yesterday();
            $startOfMonth = $date->copy()->startOfMonth();
            $yesterdayFormatted = $date->locale('id')->isoFormat('dddd, D MMMM YYYY');

        // Ambil penjualan kemarin per seller (exclude Umi)
        $dailySales = Sales::with(['seller', 'items'])
            ->whereDate('transaction_at', $date->format('Y-m-d'))
            ->whereHas('seller', function($query) {
                $query->where('name', '!=', 'Umi');
            })
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

        // Ambil akumulasi penjualan bulan ini (exclude Umi)
        $monthlySales = Sales::with(['seller', 'items'])
            ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $date->format('Y-m-d')])
            ->whereHas('seller', function($query) {
                $query->where('name', '!=', 'Umi');
            })
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

        if ($dailySales->isEmpty() && $monthlySales->isEmpty()) {
            $this->info("Tidak ada data penjualan untuk kemarin ({$date->format('Y-m-d')}).");
            return 0;
        }

        // Gabungkan data
        $salesData = [];
        $allSellerIds = $dailySales->keys()->merge($monthlySales->keys())->unique();

        foreach ($allSellerIds as $sellerId) {
            $daily = $dailySales->get($sellerId);
            $monthly = $monthlySales->get($sellerId);
            
            $sellerName = $daily['seller']->name ?? $monthly['seller']->name ?? 'Unknown';
            $monthlyQty = $monthly['total_quantity'] ?? 0;
            
            $daysWorked = Sales::where('seller_id', $sellerId)
                ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $date->format('Y-m-d')])
                ->selectRaw('COUNT(DISTINCT DATE(transaction_at)) as days_count')
                ->value('days_count');
            
            $averagePerDay = $daysWorked > 0 ? round($monthlyQty / $daysWorked, 1) : 0;
            
            $salesData[] = [
                'name' => $sellerName,
                'daily_quantity' => $daily['total_quantity'] ?? 0,
                'monthly_quantity' => $monthlyQty,
                'days_worked' => $daysWorked,
                'average_per_day' => $averagePerDay,
            ];
        }

        usort($salesData, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        // Build pesan WhatsApp
        $message = "📊 Laporan Penjualan Kemarin Tanggal $yesterdayFormatted\n\n";

        foreach ($salesData as $data) {
            $message .= "👤 *{$data['name']}*\n";
            $message .= "📅 Kemarin: {$data['daily_quantity']} pcs\n";
            $message .= "📆 Bulan Ini: {$data['monthly_quantity']} pcs\n";
            $message .= "📈 Rata-rata/hari: {$data['average_per_day']} pcs ({$data['days_worked']} hari berangkat)\n";
            $message .= "----------------------\n";
        }

        $totalDailyQuantity = collect($salesData)->sum('daily_quantity');
        $totalMonthlyQuantity = collect($salesData)->sum('monthly_quantity');
        $totalDaysWorked = collect($salesData)->sum('days_worked');
        $totalAveragePerDay = $totalDaysWorked > 0 ? round($totalMonthlyQuantity / $totalDaysWorked, 1) : 0;

        $message .= "\n📊 *TOTAL*\n";
        $message .= "📅 Kemarin: {$totalDailyQuantity} pcs\n";
        $message .= "📆 Bulan Ini: {$totalMonthlyQuantity} pcs\n";
        $message .= "📈 Rata-rata/hari: {$totalAveragePerDay} pcs\n";

        $response = $this->waService->sendGroup($message);
        $this->info("Pesan terkirim: " . json_encode($response));

        return 0;
        } catch (\Exception $e) {
            Log::error('RunWaDaily yesterdaySummary error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => ($this->date ?? Carbon::yesterday())->format('Y-m-d')
            ]);
            $this->error('Terjadi kesalahan saat mengirim summary harian: ' . $e->getMessage());
            return 1;
        }
    }
}
