import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock } from "lucide-react"

export default function SalesDetailInfo({ data }) {
    const totalPrice = data.items.reduce(
        (sum, item) => sum + (item.price || 0),
        data.totalPrice || 0
    )

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const calculateDaysUntilDue = (tempoAt) => {
        if (!tempoAt) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(tempoAt);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    const getTempoDisplay = (tempoAt) => {
        if (!tempoAt) return { date: "-", daysText: null, isOverdue: false };
        
        const daysUntil = calculateDaysUntilDue(tempoAt);
        const isOverdue = daysUntil < 0;
        
        let daysText = null;
        if (daysUntil > 0) {
            daysText = `${daysUntil} hari lagi`;
        } else if (daysUntil < 0) {
            daysText = `${Math.abs(daysUntil)} hari yang lalu`;
        } else {
            daysText = "Hari ini";
        }
        
        return {
            date: formatDate(tempoAt),
            daysText,
            isOverdue,
        };
    };

    return (
        <div className="space-y-4">
            {/* STATUS */}
            <div className="text-center">
                {data.isLunas ? (
                    <div className="text-2xl md:text-4xl font-extrabold text-green-600">
                        LUNAS
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Badge variant="destructive" className="text-sm md:text-lg px-4 md:px-6 py-1 md:py-2">
                            BELUM LUNAS
                        </Badge>
                        <p className="text-red-600 font-semibold text-sm md:text-base">
                            Sisa: Rp {data.remaining.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* CUSTOMER */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Informasi Customer</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
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
                    <CardTitle className="text-lg md:text-xl">Alamat</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p className="font-medium break-words">{data.address.street}</p>
                    {data.address.village && <p className="break-words">Desa: {data.address.village}</p>}
                    <p className="break-words">Kecamatan: {data.address.subdistrict}</p>
                    <p className="break-words">Kabupaten/Kota: {data.address.city}</p>
                    {data.address.province && <p className="break-words">Provinsi: {data.address.province}</p>}
                </CardContent>
            </Card>

            {/* ITEMS */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg md:text-xl">Daftar Item</CardTitle>
                    <Badge variant="outline" className="text-xs md:text-sm">{data.items.length} Item</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {data.items.map((item, i) => (
                        <div
                            key={i}
                            className="flex flex-col md:flex-row md:justify-between gap-2 border rounded-md p-3 hover:bg-gray-50"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">
                                    {item.product || 'Produk'}
                                </p>
                                <p className="text-muted-foreground text-xs md:text-sm">
                                    Warna: {item.color || '-'} | Size: {item.size || '-'} | Qty: {item.quantity || 1}
                                </p>
                            </div>
                            <div className="font-medium text-sm md:text-base flex-shrink-0">
                                Rp {(item.price || 0).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* SUMMARY */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Ringkasan</CardTitle>
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
                    {data.tempoAt && (
                        <div className="flex justify-between items-start">
                            <span>Tanggal Jatuh Tempo</span>
                            <div className="flex flex-col items-end">
                                {(() => {
                                    const tempo = getTempoDisplay(data.tempoAt);
                                    return (
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5">
                                                {tempo.isOverdue && (
                                                    <Clock className="w-4 h-4 text-red-600" />
                                                )}
                                                <span
                                                    className={`font-semibold ${
                                                        tempo.isOverdue
                                                            ? "text-red-600"
                                                            : ""
                                                    }`}
                                                >
                                                    {tempo.date}
                                                </span>
                                            </div>
                                            {tempo.daysText && (
                                                <span
                                                    className={`text-xs mt-0.5 ${
                                                        tempo.isOverdue
                                                            ? "text-red-600"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {tempo.daysText}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
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
                                <p className="text-xs md:text-sm italic break-words">{data.note}</p>
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