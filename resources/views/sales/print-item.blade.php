<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Kartu</title>
    <style>
        /* Sesuaikan posisi elemen berdasarkan layout kartu fisik */
        .kartu {
            width: 21.5cm;
            height: 14.8cm;
            position: relative;
            font-family: Arial, sans-serif;
        }

        .no-kartu {
            position: absolute;
            top: 3.8cm;
            bottom: 16.5cm;
            left: 8cm;
            font-size: 12pt;
        }

        .nama {
            position: absolute;
            top: 4.4cm;
            bottom: 16cm;
            left: 8cm;
            font-size: 12pt;
        }

        .alamat {
            position: absolute;
            top: 5cm;
            bottom: 15.5cm;
            left: 8cm;
            font-size: 12pt;
        }

        .kecamatan {
            position: absolute;
            top: 5.5cm;
            bottom: 15cm;
            left: 8cm;
            font-size: 12pt;
        }

        .tgl-pengambilan {
            position: absolute;
            top: 6.1cm;
            bottom: 14.5cm;
            left: 8cm;
            font-size: 12pt;
        }

        .kode {
            position: absolute;
            top: 6.7cm;
            bottom: 14cm;
            left: 8cm;
            font-size: 12pt;
        }

        .harga {
            position: absolute;
            top: 7.2cm;
            bottom: 13.5cm;
            left: 8cm;
            font-size: 12pt;
        }

        .tg-ang {
            position: absolute;
            top: 8.3cm;
            bottom: 13.5cm;
            left: 8cm;
            font-size: 12pt;
        }

        .tempo {
            position: absolute;
            top: 8.9cm;
            bottom: 13.5cm;
            left: 8cm;
            font-size: 12pt;
        }

        .dp {
            position: absolute;
            top: 11.1cm;
            bottom: 13.5cm;
            left: 7cm;
            font-size: 10pt;
            margin-right: 10px;
        }

        .ket {
            position: absolute;
            top: 19cm;
            bottom: 12.5cm;
            left: 5.7cm;
            font-size: 12pt;
        }

        @page {
            margin: 0;
        }

        body {
            margin: 0;
        }
    </style>
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</head>
<body>
    <div class="kartu">
        <div class="no-kartu">{{ $printData['no_kartu'] }}</div>
        <div class="nama">
            {{ $printData['nama'] }} 
            @if(!empty($printData['no_telp']))
                ( {{ $printData['no_telp'] }} )
            @endif
        </div>
        <div class="alamat">{{ $printData['alamat'] }}</div>
        <div class="kecamatan">{{ $printData['kecamatan'] }}, {{ $printData['kabupaten'] }}</div>
        <div class="tgl-pengambilan">
            {{ $printData['tgl_pengambilan'] }}
        </div>
        
        <div class="kode">{{ $printData['nama_produk'] }} - {{ $printData['warna'] }} - {{ $printData['size'] }}</div>
        <div class="harga">{{ number_format($printData['harga'], 0, ',', '.') }}</div>
        <div class="tg-ang">
            @if($printData['is_tempo'])
                CASH TEMPO
            @endif
        </div>
        @if (!$printData['is_tempo'])
            <div class="tempo">{{ number_format($printData['harga'] / 5, 0, ',', '.') }} x 5</div>
        @endif
        <div class="dp">
            <span style="margin-right: 0.9cm">{{ !empty($printData['ang1']) && $printData['ang1'] > 0 ? number_format($printData['ang1'], 0, ',', '.') : '' }}</span>
            <span style="margin-right: 0.5cm">
                @if(!empty($printData['ang1']) && $printData['ang1'] > 0)
                    {{ number_format($printData['harga'] - $printData['ang1'], 0, ',', '.') }}
                @endif
            </span>
            <span style="margin-right: 0.5cm">
                {{ !empty($printData['tgl_ang1']) ? \Carbon\Carbon::parse($printData['tgl_ang1'])->format('d-m-y') : '' }}
            </span>
            <span style="margin-right: 0.7cm">{{ $printData['coll1'] ?? '' }}</span>
        </div>
        
        <div class="ket">{{ $printData['ket'] }}</div>
    </div>
</body>
</html>

