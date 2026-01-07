import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Printer, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePage } from "@inertiajs/react"
import ChangeToCashTempoModal from "../ChangeToCashTempoModal"
import ChangeToCreditModal from "../ChangeToCreditModal"

export default function SalesDetailInfo({ data, saleId, collectors }) {
    const { auth } = usePage().props;
    const [showChangeToCashTempoModal, setShowChangeToCashTempoModal] = useState(false);
    const [showChangeToCreditModal, setShowChangeToCreditModal] = useState(false);
    
    // Use the actual sales price from data, not calculated from items
    const currentPrice = data.totalPrice || 0;
    
    // Calculate total price for display (sum of items)
    const totalPrice = data.items.reduce(
        (sum, item) => sum + (item.price || 0),
        data.totalPrice || 0
    )

    // Check if user can access change to cash tempo feature
    const canChangeToCashTempo = auth.user && ['SUPER_ADMIN', 'ADMIN'].includes(auth.user.role);
    
    // Check if change to cash tempo button should be shown (only for credit payment type and no installments)
    const showChangeToCashTempoButton = canChangeToCashTempo && 
                                        data.paymentType === 'credit' && 
                                        (!data.installments || data.installments.length === 0);

    // Check if user can access change to credit feature
    const canChangeToCredit = auth.user && ['SUPER_ADMIN', 'ADMIN'].includes(auth.user.role);
    
    // Check if change to credit button should be shown (only for cash_tempo payment type and no installments)
    const showChangeToCreditButton = canChangeToCredit && 
                                     data.paymentType === 'cash_tempo' && 
                                     (!data.installments || data.installments.length === 0) &&
                                     !data.is_return;

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
                    {showChangeToCashTempoButton && (
                        <div className="col-span-1 md:col-span-2">
                            <Button
                                onClick={() => setShowChangeToCashTempoModal(true)}
                                variant="outline"
                                size="sm"
                                className="w-full md:w-auto"
                            >
                                Change to Cash Tempo
                            </Button>
                        </div>
                    )}
                    {showChangeToCreditButton && (
                        <div className="col-span-1 md:col-span-2">
                            <Button
                                onClick={() => setShowChangeToCreditModal(true)}
                                variant="outline"
                                size="sm"
                                className="w-full md:w-auto"
                            >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Change to Credit
                            </Button>
                        </div>
                    )}
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
                    {data.items.map((item, i) => {
                        const [showPrintCount, setShowPrintCount] = useState(false);
                        
                        const handlePrint = (e) => {
                            e.stopPropagation();
                            const printUrl = route('sales.items.print', { saleId, itemId: item.id });
                            window.open(printUrl, '_blank');
                        };

                        return (
                            <div
                                key={item.id || i}
                                className="flex flex-col md:flex-row md:justify-between gap-2 border rounded-md p-3 hover:bg-gray-50 relative group"
                                onMouseEnter={() => setShowPrintCount(true)}
                                onMouseLeave={() => setShowPrintCount(false)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">
                                        {item.product || 'Produk'}
                                    </p>
                                    <p className="text-muted-foreground text-xs md:text-sm">
                                        Warna: {item.color || '-'} | Size: {item.size || '-'} | Qty: {item.quantity || 1}
                                    </p>
                                    {showPrintCount && (
                                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                            <p>Dicetak: {item.print_count || 0} kali</p>
                                            {item.last_printed_at && (
                                                <p>
                                                    Terakhir cetak: {new Date(item.last_printed_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="font-medium text-sm md:text-base flex-shrink-0">
                                        Rp {(item.price || 0).toLocaleString()}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                        className="h-8 w-8 p-0 flex-shrink-0"
                                        title="Cetak Kartu"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
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

            {/* Change to Cash Tempo Modal */}
            <ChangeToCashTempoModal
                open={showChangeToCashTempoModal}
                setOpen={setShowChangeToCashTempoModal}
                salesId={saleId}
                currentPrice={currentPrice}
                collectors={collectors}
            />

            {/* Change to Credit Modal */}
            <ChangeToCreditModal
                open={showChangeToCreditModal}
                setOpen={setShowChangeToCreditModal}
                salesId={saleId}
                currentPrice={currentPrice}
                collectors={collectors}
            />
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