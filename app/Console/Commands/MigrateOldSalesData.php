<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\{Sale, Sales, SalesItem, SalesInstallment, SalesOutstanding};
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MigrateOldSalesData extends Command
{
    protected $signature = 'migrate:old-sales';
    protected $description = 'Migrate data from old my_zanov table to new structure';

    // Cache untuk data lokasi
    private $provinces = [];
    private $cities = [];
    private $subdistricts = [];

    public function handle(): void
    {
        $this->info('Starting migration from old database...');

        // Load cache data lokasi dari database baru
        $this->loadLocationData();

        // Koneksi ke database lama
        $oldData = DB::connection('mysql_old')->table('sales')->get();

        $bar = $this->output->createProgressBar(count($oldData));
        $bar->start();

        $successCount = 0;
        $failedCount = 0;

        foreach ($oldData as $oldSale) {
            try {
                DB::transaction(function () use ($oldSale) {
                    // 1. Generate invoice
                    $invoice = 'INV-' . date('Ymd') . '-' . date('His') . '-' . Str::upper(Str::random(8));

                    // 2. Tentukan seller_id berdasarkan nama sales
                    $sellerId = $this->getSellerId($oldSale->nama_sales);

                    // 3. Tentukan lokasi
                    $locationData = $this->getLocationData($oldSale->kecamatan, $oldSale->kabupaten);

                    // 4. Tentukan payment_type dan status
                    $paymentData = $this->getPaymentData($oldSale);

                    // 5. Tentukan tempo
                    $tempoData = $this->getTempoData($oldSale);

                    // 6. Create sale
                    $sale = Sales::create([
                        'invoice' => $invoice,
                        'card_number' => $oldSale->no_kartu,
                        'price' => (float) $oldSale->harga,
                        'customer_name' => $oldSale->nama,
                        'phone' => $oldSale->no_telp,
                        'province_id' => $locationData['province_id'],
                        'city_id' => $locationData['city_id'],
                        'subdistrict_id' => $locationData['subdistrict_id'],
                        'village_id' => null, // Selalu null sesuai permintaan
                        'address' => $oldSale->alamat ?? 'Alamat tidak diketahui',
                        'seller_id' => $sellerId,
                        'payment_type' => $paymentData['payment_type'],
                        'status' => $paymentData['status'],
                        'transaction_at' => $oldSale->tgl_pengambilan ?? $oldSale->created_at,
                        'is_tempo' => $tempoData['is_tempo'],
                        'tempo_at' => $tempoData['tempo_at'],
                        'note' => $oldSale->ket,
                        'created_at' => $oldSale->created_at ?? null,
                        'updated_at' => $oldSale->updated_at ?? null,
                    ]);

                    // 7. Create sales item
                    SalesItem::create([
                        'sale_id' => $sale->id,
                        'product_name' => $oldSale->nama_produk ?? null,
                        'color' => $oldSale->warna ?? null,
                        'size' => $oldSale->size ?? null,
                        'quantity' => 1, // Default quantity 1
                        'print_count' => 1,
                    ]);

                    // 8. Create installments jika ada
                    $totalInstallments = 0;
                    $installments = [
                        ['date' => $oldSale->tgl_ang1, 'amount' => $oldSale->ang1, 'collector' => $oldSale->coll1],
                        ['date' => $oldSale->tgl_ang2, 'amount' => $oldSale->ang2, 'collector' => $oldSale->coll2],
                        ['date' => $oldSale->tgl_ang3, 'amount' => $oldSale->ang3, 'collector' => $oldSale->coll3],
                        ['date' => $oldSale->tgl_ang4, 'amount' => $oldSale->ang4, 'collector' => $oldSale->coll4],
                        ['date' => $oldSale->tgl_ang5, 'amount' => $oldSale->ang5, 'collector' => $oldSale->coll5],
                    ];

                    foreach ($installments as $index => $installment) {
                        if ($installment['amount'] > 0) {
                            $collectorId = $this->getCollectorId($installment['collector']);

                            SalesInstallment::create([
                                'sale_id' => $sale->id,
                                'installment_amount' => (float) $installment['amount'],
                                'collector_id' => $collectorId,
                                'payment_date' => $installment['date'] ?? null,
                            ]);

                            $totalInstallments += (float) $installment['amount'];
                        }
                    }

                    // 9. Create outstanding (selalu dibuat, walau 0 atau minus)
                    $totalPrice = (float) $oldSale->harga;
                    $outstanding = $totalPrice - $totalInstallments;

                    SalesOutstanding::create([
                        'sale_id' => $sale->id,
                        'outstanding_amount' => $outstanding,
                    ]);
                });

                $successCount++;
            } catch (\Exception $e) {
                Log::error('Migration failed for old sale ID ' . $oldSale->id . ': ' . $e->getMessage());
                $failedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $this->info("\nMigration completed!");
        $this->info("Successfully migrated: {$successCount} records");
        $this->info("Failed to migrate: {$failedCount} records");
    }

    private function loadLocationData(): void
    {
        // Load Jawa Tengah province
        $jawaTengah = DB::table('provinces')
            ->where('name', 'LIKE', '%JAWA TENGAH%')
            ->first();

        if ($jawaTengah) {
            $this->provinces['JAWA TENGAH'] = $jawaTengah->id;

            // Load semua cities di Jawa Tengah
            $cities = DB::table('cities')
                ->where('province_id', $jawaTengah->id)
                ->get();

            foreach ($cities as $city) {
                $this->cities[$city->name] = $city->id;
            }

            // Load semua subdistricts di Jawa Tengah
            $subdistricts = DB::table('subdistricts')
                ->whereIn('city_id', $cities->pluck('id'))
                ->get();

            foreach ($subdistricts as $subdistrict) {
                $this->subdistricts[$subdistrict->name] = [
                    'id' => $subdistrict->id,
                    'city_id' => $subdistrict->city_id
                ];
            }
        }
    }

    private function getSellerId(?string $namaSales): ?int
    {
        if (empty($namaSales)) {
            return null;
        }

        // rapikan dan bikin lowercase
        $namaSales = strtolower(trim($namaSales));

        $user = DB::table('users')
            ->where('role', 'sales')
            ->whereRaw('LOWER(name) LIKE ?', ["%{$namaSales}%"])
            ->first();

        return $user?->id ?? null;
    }


    private function getCollectorId(?string $collectorName): ?int
    {
        if (empty($collectorName)) {
            return null;
        }

        // rapikan dan bikin lowercase
        $collectorName = strtolower(trim($collectorName));

        $user = DB::table('users')
            ->where('role', 'collector')
            ->whereRaw('LOWER(name) LIKE ?', ["%{$collectorName}%"])
            ->first();

        return $user?->id ?? null;
    }


    private function getLocationData(?string $kecamatan, ?string $kabupaten): array
    {
        $provinceId = $this->provinces['JAWA TENGAH'] ?? null;
        $cityId = null;
        $subdistrictId = null;

        // Cari city berdasarkan kabupaten
        if ($kabupaten) {
            $kabupaten = strtoupper(trim($kabupaten));
            foreach ($this->cities as $cityName => $id) {
                if (str_contains($cityName, $kabupaten) || str_contains($kabupaten, $cityName)) {
                    $cityId = $id;
                    break;
                }
            }
        }

        // Cari subdistrict berdasarkan kecamatan
        if ($kecamatan) {
            $kecamatan = strtoupper(trim($kecamatan));
            foreach ($this->subdistricts as $subdistrictName => $data) {
                if (str_contains($subdistrictName, $kecamatan) || str_contains($kecamatan, $subdistrictName)) {
                    $subdistrictId = $data['id'];
                    // Jika city belum ditemukan, gunakan city dari subdistrict
                    if (!$cityId && isset($data['city_id'])) {
                        $cityId = $data['city_id'];
                    }
                    break;
                }
            }
        }

        return [
            'province_id' => $provinceId,
            'city_id' => $cityId,
            'subdistrict_id' => $subdistrictId,
        ];
    }

    private function getPaymentData($oldSale): array
    {
        $totalPrice = (float) $oldSale->harga;
        $totalPaid = 0;
        $paymentCount = 0;
        $firstInstallmentAmount = 0;

        // Hitung total angsuran yang sudah dibayar dan jumlah installment
        for ($i = 1; $i <= 5; $i++) {
            $angField = 'ang' . $i;
            if ($oldSale->$angField > 0) {
                $totalPaid += (float) $oldSale->$angField;
                $paymentCount++;
                // Simpan jumlah installment pertama
                if ($paymentCount == 1) {
                    $firstInstallmentAmount = (float) $oldSale->$angField;
                }
            }
        }

        // Hitung outstanding
        $outstanding = $totalPrice - $totalPaid;

        // Tentukan payment_type
        $paymentType = 'credit'; // Default

        // 1. Cek apakah keterangan mengandung 'TEMPO'
        if ($oldSale->ket && stripos($oldSale->ket, 'TEMPO') !== false) {
            $paymentType = 'cash_tempo';
        }
        // 2. Cek apakah cash (installment = 1 dan jumlah = total price)
        elseif ($paymentCount == 1 && abs($firstInstallmentAmount - $totalPrice) < 0.01) {
            $paymentType = 'cash';
        }
        // 3. Cek apakah credit (installment > 1)
        elseif ($paymentCount > 1) {
            $paymentType = 'credit';
        }

        // Tentukan status berdasarkan outstanding
        $status = $outstanding > 0 ? 'unpaid' : 'paid';

        return [
            'payment_type' => $paymentType,
            'status' => $status,
        ];
    }

    private function getTempoData($oldSale): array
    {
        $isTempo = false;
        $tempoAt = null;

        // Cek apakah ada kata "TEMPO" di keterangan
        if ($oldSale->ket && stripos($oldSale->ket, 'TEMPO') !== false) {
            $isTempo = true;

            // Set tempo_at = tgl_pengambilan + 1 bulan
            if ($oldSale->tgl_pengambilan) {
                $tempoAt = date('Y-m-d H:i:s', strtotime($oldSale->tgl_pengambilan . ' +1 month'));
            }
        }

        return [
            'is_tempo' => $isTempo,
            'tempo_at' => $tempoAt,
        ];
    }
}
