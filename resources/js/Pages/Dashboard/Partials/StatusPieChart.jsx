import Chart from "react-apexcharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Fungsi untuk format label status
const formatStatusLabel = (label) => {
    const labelMap = {
        'paid': 'Lunas',
        'unpaid': 'Belum Lunas',
    };
    return labelMap[label] || label;
};

export default function StatusPieChart({ data, loading = false }) {
    const formattedLabels = data?.labels?.map(label => formatStatusLabel(label)) || [];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan per Status</CardTitle>
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
                        Tidak ada data status
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

