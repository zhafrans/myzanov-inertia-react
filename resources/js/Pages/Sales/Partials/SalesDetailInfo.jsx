import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SalesDetailInfo({ data }) {
    const totalPrice = data.items.reduce(
        (sum, item) => sum + (item.price || 0),
        data.totalPrice || 0
    )

    return (
        <div className="space-y-4">
            {/* STATUS */}
            <div className="text-center">
                {data.isLunas ? (
                    <div className="text-4xl font-extrabold text-green-600">
                        LUNAS
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Badge variant="destructive" className="text-lg px-6 py-2">
                            BELUM LUNAS
                        </Badge>
                        <p className="text-red-600 font-semibold">
                            Sisa: Rp {data.remaining.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* CUSTOMER */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Customer</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <Info label="No Kartu" value={data.customer.cardNo} />
                    <Info label="Nama" value={data.customer.name} />
                    <Info label="No. Telp" value={data.customer.phone} />
                    <Info label="Nama Sales" value={data.salesName} />
                    <Info label="Tipe Pembayaran" value={data.paymentType} />
                    <Info label="Status" value={data.status} />
                </CardContent>
            </Card>

            {/* ADDRESS */}
            <Card>
                <CardHeader>
                    <CardTitle>Alamat</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p className="font-medium">{data.address.street}</p>
                    {data.address.village && <p>Desa: {data.address.village}</p>}
                    <p>Kecamatan: {data.address.subdistrict}</p>
                    <p>Kabupaten/Kota: {data.address.city}</p>
                    {data.address.province && <p>Provinsi: {data.address.province}</p>}
                </CardContent>
            </Card>

            {/* ITEMS */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Item</CardTitle>
                    <Badge variant="outline">{data.items.length} Item</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {data.items.map((item, i) => (
                        <div
                            key={i}
                            className="flex justify-between border rounded-md p-3 hover:bg-gray-50"
                        >
                            <div>
                                <p className="font-semibold">
                                    {item.product || 'Produk'}
                                </p>
                                <p className="text-muted-foreground">
                                    Warna: {item.color || '-'} | Size: {item.size || '-'} | Qty: {item.quantity || 1}
                                </p>
                            </div>
                            <div className="font-medium">
                                Rp {(item.price || 0).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* SUMMARY */}
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <Summary
                        label="Tanggal Transaksi"
                        value={data.transactionDate}
                    />
                    <Summary
                        label="Total Harga"
                        value={`Rp ${totalPrice.toLocaleString()}`}
                    />
                    {data.isTempo && data.tempoAt && (
                        <Summary
                            label="Tempo"
                            value={`${data.isTempo === 'yes' ? 'Ya' : 'Tidak'} - ${data.tempoAt}`}
                        />
                    )}
                    <Separator />
                    <Summary
                        label="Sisa Tagihan"
                        value={`Rp ${data.remaining.toLocaleString()}`}
                        highlight={!data.isLunas}
                    />
                    {data.note && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-muted-foreground mb-1">Catatan:</p>
                                <p className="text-sm italic">{data.note}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    )
}

function Summary({ label, value, highlight }) {
    return (
        <div className="flex justify-between">
            <span>{label}</span>
            <span
                className={`font-semibold ${
                    highlight ? "text-red-600" : ""
                }`}
            >
                {value}
            </span>
        </div>
    )
}