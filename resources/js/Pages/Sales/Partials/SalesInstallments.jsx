import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SalesInstallments({ data, installments }) {
    const installmentsData = installments || data.installments || []

    if (installmentsData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada riwayat pembayaran</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Riwayat Pembayaran</h2>
                <p className="text-sm text-muted-foreground">
                    Total {installmentsData.length} kali pembayaran
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {installmentsData.map((installment, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base">
                                    Angsuran {installment.number || index + 1}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    #{String(index + 1).padStart(2, '0')}
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal:</span>
                                <span className="font-medium">{installment.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nominal:</span>
                                <span className="font-bold text-green-600">
                                    Rp {installment.amount?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Collector:</span>
                                <span className="font-medium">{installment.collector}</span>
                            </div>
                            {installment.payment_date && (
                                <div className="pt-2 border-t text-xs text-muted-foreground">
                                    Dibayar: {new Date(installment.payment_date).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Summary */}
            {data.totalPrice && data.remaining !== undefined && (
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Tagihan</p>
                                <p className="text-lg font-bold">
                                    Rp {data.totalPrice.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Dibayar</p>
                                <p className="text-lg font-bold text-green-600">
                                    Rp {(data.totalPrice - data.remaining).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
                                <p className={`text-lg font-bold ${data.isLunas ? 'text-green-600' : 'text-red-600'}`}>
                                    Rp {data.remaining.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}