import Chart from "react-apexcharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalesPieChart({ data, loading = false }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan per Sales</CardTitle>
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
                            labels: data.labels,
                            legend: { position: "bottom" },
                        }}
                    />
                ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                        Tidak ada data sales
                    </div>
                )}
            </CardContent>
        </Card>
    )
}