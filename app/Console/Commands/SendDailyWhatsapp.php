<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsappApiService;
use App\Services\OpenRouterService;
use App\Models\Sales;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendDailyWhatsapp extends Command
{
    protected $signature = 'wa:send-daily';
    protected $description = 'Kirim data penjualan harian melalui WhatsApp API';

    protected WhatsappApiService $waService;
    protected OpenRouterService $openRouterService;

    public function __construct(WhatsappApiService $waService, OpenRouterService $openRouterService)
    {
        parent::__construct();
        $this->waService = $waService;
        $this->openRouterService = $openRouterService;
    }

    public function handle()
    {
        $date = Carbon::create(2025, 11, 18);
        // $date = Carbon::today();

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
        ])->whereDate('transaction_at', $date->format('Y-m-d'))->get();


        if ($sales->isEmpty()) {
            $this->info("Tidak ada data penjualan untuk hari ini ({$date->format('Y-m-d')}).");
            return 0;
        }

        $todayFormatted = $date->locale('id')->isoFormat('dddd, D MMMM YYYY');
        $message = "📊 Data Penjualan Tanggal $todayFormatted:\n\n";
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

            // Build konteks untuk AI (dengan info lengkap termasuk seller dan alamat)
            $aiContext .= "- Invoice: {$sale->invoice}, Customer: {$sale->customer_name}, Produk: " . $sale->items->pluck('product_name')->implode(', ') . " Seller: " . ($sale->seller->name ?? '-') . ", Alamat: $fullAddress\n";
        }

        // Kirim data lengkap via WA saja
        // $response = $this->waService->sendGroup($message);
        // $this->info("Pesan terkirim: " . json_encode($response));

        // Kirim summary penjualan menggunakan AI
        $question = 
            "Tolong buatkan ringkasan penjualan hari ini tanggal {$todayFormatted} untuk dikirim ke grup WhatsApp rekan-rekan ZANOV Shoes Purwokerto.\n\n
            Ketentuan bahasa:\n
            - Gunakan bahasa Jawa Ngapak (ngoko), santai, lucu, tidak pakai bahasa krama.\n
            - Tulis seperti percakapan WhatsApp yang natural.\n\n
            Tugas:\n
            - Buat ringkasan jumlah total penjualan hari ini.\n
            - Sebutkan total pcs terjual (invoice diganti istilah \"pcs\").\n
            - Sebutkan rata-rata jualan banyaknya di daerah mana (ambil dari data \"Alamat\").\n
            - Sebutkan siapa yang penjualannya paling sedikit.\n
            - Sebutkan siapa yang penjualannya paling banyak.\n
            - Jangan tampilkan detail per transaksi. Cukup ringkasan saja.\n\n
            Catatan penting:\n
            - Jangan sampai ada tanda bintang (*) double di WhatsApp.\n
            - Jika penjualan sedikit, beri kalimat penyemangat yang lucu pakai bahasa Jawa ngapak.\n
            - Jika penjualan bagus, beri pujian yang lucu pakai bahasa Jawa ngapak.\n
            - Gunakan istilah \"pcs\" bukan \"invoice\".\n
            - Buat kalimat yang natural, enak dibaca, tidak kaku.\n\n
            Akhiri dengan:\n
            - Penutup yang sopan tapi santai.\n
            - Salam dari ZANOVIA, AI ne ZANOV Shoes Purwokerto.\n\n
            Berikut data penjualannya:\n
            {$aiContext}";


        $summary = $this->openRouterService->chat($question);

        // Kirim summary via WA dan sudah di summary AI
        $responseSummary = $this->waService->sendGroup("📝 Ringkasan Penjualan $todayFormatted:\n\n" . $summary);
        $this->info("Pesan summary terkirim: " . json_encode($responseSummary));

        return 0;
    }

    
    // public function handle()
    // {
    //     $date = Carbon::create(2025, 8, 23);
    //     // $date = Carbon::today();

    //     $startOfMonth = $date->copy()->startOfMonth();
    //     $todayFormatted = $date->locale('id')->isoFormat('dddd, D MMMM YYYY');

    //     // Ambil penjualan hari ini per seller dengan jumlah quantity
    //     $dailySales = Sales::with(['seller', 'items'])
    //         ->whereDate('transaction_at', $date->format('Y-m-d'))
    //         ->get()
    //         ->groupBy('seller_id')
    //         ->map(function ($sales) {
    //             $totalQuantity = $sales->sum(function ($sale) {
    //                 return $sale->items->sum('quantity');
    //             });
                
    //             return [
    //                 'seller' => $sales->first()->seller,
    //                 'total_quantity' => $totalQuantity,
    //                 'total_transactions' => $sales->count()
    //             ];
    //         });

    //     // Ambil akumulasi penjualan dari awal bulan hingga hari ini per seller
    //     $monthlySales = Sales::with(['seller', 'items'])
    //         ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $date->format('Y-m-d')])
    //         ->get()
    //         ->groupBy('seller_id')
    //         ->map(function ($sales) {
    //             $totalQuantity = $sales->sum(function ($sale) {
    //                 return $sale->items->sum('quantity');
    //             });
                
    //             return [
    //                 'seller' => $sales->first()->seller,
    //                 'total_quantity' => $totalQuantity,
    //                 'total_transactions' => $sales->count()
    //             ];
    //         });

    //     if ($dailySales->isEmpty() && $monthlySales->isEmpty()) {
    //         $this->info("Tidak ada data penjualan untuk hari ini ({$date->format('Y-m-d')}).");
    //         return 0;
    //     }

    //     // Gabungkan data daily dan monthly
    //     $salesData = [];
        
    //     // Ambil semua seller dari daily dan monthly
    //     $allSellerIds = $dailySales->keys()->merge($monthlySales->keys())->unique();

    //     foreach ($allSellerIds as $sellerId) {
    //         $daily = $dailySales->get($sellerId);
    //         $monthly = $monthlySales->get($sellerId);
            
    //         $sellerName = $daily['seller']->name ?? $monthly['seller']->name ?? 'Unknown';
    //         $monthlyQty = $monthly['total_quantity'] ?? 0;
            
    //         // Hitung jumlah hari seller berangkat (ada penjualan) bulan ini
    //         $daysWorked = Sales::where('seller_id', $sellerId)
    //             ->whereBetween('transaction_at', [$startOfMonth->format('Y-m-d'), $date->format('Y-m-d')])
    //             ->selectRaw('COUNT(DISTINCT DATE(transaction_at)) as days_count')
    //             ->value('days_count');
            
    //         $averagePerDay = $daysWorked > 0 ? round($monthlyQty / $daysWorked, 1) : 0;
            
    //         $salesData[] = [
    //             'name' => $sellerName,
    //             'daily_quantity' => $daily['total_quantity'] ?? 0,
    //             'monthly_quantity' => $monthlyQty,
    //             'days_worked' => $daysWorked,
    //             'average_per_day' => $averagePerDay,
    //         ];
    //     }

    //     // Sort berdasarkan nama sales (A-Z)
    //     usort($salesData, function($a, $b) {
    //         return strcmp($a['name'], $b['name']);
    //     });

    //     // Build pesan WhatsApp
    //     $message = "📊 Laporan Penjualan Tanggal $todayFormatted\n\n";

    //     foreach ($salesData as $data) {
    //         $message .= "👤 *{$data['name']}*\n";
    //         $message .= "📅 Hari Ini: {$data['daily_quantity']} pcs\n";
    //         $message .= "📆 Bulan Ini: {$data['monthly_quantity']} pcs\n";
    //         $message .= "📈 Rata-rata/hari: {$data['average_per_day']} pcs ({$data['days_worked']} hari berangkat)\n";
    //         $message .= "----------------------\n";
    //     }

    //     // Total keseluruhan
    //     $totalDailyQuantity = collect($salesData)->sum('daily_quantity');
    //     $totalMonthlyQuantity = collect($salesData)->sum('monthly_quantity');
    //     $totalDaysWorked = collect($salesData)->sum('days_worked');
    //     $totalAveragePerDay = $totalDaysWorked > 0 ? round($totalMonthlyQuantity / $totalDaysWorked, 1) : 0;

    //     $message .= "\n📊 *TOTAL*\n";
    //     $message .= "📅 Hari Ini: {$totalDailyQuantity} pcs\n";
    //     $message .= "📆 Bulan Ini: {$totalMonthlyQuantity} pcs\n";
    //     $message .= "📈 Rata-rata/hari: {$totalAveragePerDay} pcs\n";

    //     // Kirim data via WA
    //     $response = $this->waService->sendGroup($message);
    //     $this->info("Pesan terkirim: " . json_encode($response));

    //     return 0;
    // }
    
}