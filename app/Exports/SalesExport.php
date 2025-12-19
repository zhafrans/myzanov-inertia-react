<?php

namespace App\Exports;

use App\Models\Sales;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesExport implements FromQuery, WithHeadings, WithMapping, WithStyles
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Sales::with(['items', 'seller'])
            ->select([
                'sales.*',
                DB::raw('(sales.price - COALESCE(SUM(sales_installments.installment_amount), 0)) as remaining_amount')
            ])
            ->leftJoin('sales_installments', 'sales.id', '=', 'sales_installments.sale_id')
            ->groupBy('sales.id');

        // Apply filters
        if (!empty($this->filters['size']) && $this->filters['size'] !== 'all') {
            $query->whereHas('items', function ($q) {
                $q->where('size', $this->filters['size']);
            });
        }

        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            if ($this->filters['status'] === 'paid') {
                $query->havingRaw('remaining_amount <= 0');
            } elseif ($this->filters['status'] === 'unpaid') {
                $query->havingRaw('remaining_amount > 0');
            }
        }

        if (!empty($this->filters['startDate'])) {
            $query->whereDate('sales.transaction_at', '>=', $this->filters['startDate']);
        }

        if (!empty($this->filters['endDate'])) {
            $query->whereDate('sales.transaction_at', '<=', $this->filters['endDate']);
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('card_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($q) use ($search) {
                        $q->where('product_name', 'like', "%{$search}%");
                    });
            });
        }

        $sort = $this->filters['sort'] ?? 'desc';
        $query->orderBy('transaction_at', $sort);

        return $query;
    }

    public function headings(): array
    {
        return [
            'No',
            'Invoice',
            'No Kartu',
            'Nama Pelanggan',
            'Sales',
            'Produk',
            'Warna',
            'Ukuran',
            'Alamat',
            'Tanggal Transaksi',
            'Harga Total',
            'Sisa Tagihan',
            'Status',
            'Tipe Pembayaran',
        ];
    }

    public function map($sale): array
    {
        static $rowNumber = 0;
        $rowNumber++;

        $firstItem = $sale->items->first();

        return [
            $rowNumber,
            $sale->invoice,
            $sale->card_number ?? '-',
            $sale->customer_name,
            $sale->seller->name ?? 'N/A',
            $firstItem->product_name ?? 'N/A',
            $firstItem->color ?? 'N/A',
            $firstItem->size ?? 'N/A',
            $sale->address,
            \Carbon\Carbon::parse($sale->transaction_at)->format('Y-m-d'),
            $sale->price,
            $sale->remaining_amount,
            $sale->remaining_amount <= 0 ? 'Lunas' : 'Belum Lunas',
            ucfirst($sale->payment_type),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
