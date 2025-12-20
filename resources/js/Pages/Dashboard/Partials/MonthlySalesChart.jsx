import Chart from "react-apexcharts"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MonthlySalesChart({ data, loading = false }) {
    const options = {
        chart: {
            toolbar: { show: false },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        xaxis: {
            categories: data?.months || [],
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
        },
        markers: {
            size: 4,
        },
        tooltip: {
            shared: true,
            intersect: false,
        },
        yaxis: {
            title: {
                text: "Jumlah Penjualan"
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan Per Bulan (Per Sales)</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-80" />
                ) : data?.series?.length > 0 ? (
                    <Chart
                        type="line"
                        height={320}
                        series={data.series}
                        options={options}
                    />
                ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                        Tidak ada data penjualan
                    </div>
                )}
            </CardContent>
        </Card>
    )
}