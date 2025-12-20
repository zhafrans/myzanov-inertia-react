import Chart from "react-apexcharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Fungsi untuk format label payment type
const formatPaymentTypeLabel = (label) => {
    const labelMap = {
        'cash': 'Cash',
        'credit': 'Credit',
        'cash_tempo': 'Cash Tempo',
    };
    return labelMap[label] || label;
};

export default function PaymentTypePieChart({ data, loading = false }) {
    const formattedLabels = data?.labels?.map(label => formatPaymentTypeLabel(label)) || [];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan per Tipe Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-80" />
                ) : data?.values?.length > 0 ? (
                    <Chart
                        type="pie"
                        height={300}
                        series={data.values}
                        options={{
                            labels: formattedLabels,
                            legend: { position: "bottom" },
                        }}
                    />
                ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                        Tidak ada data pembayaran
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

