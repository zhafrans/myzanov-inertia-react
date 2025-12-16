import Chart from "react-apexcharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function SalesPieChart({ data }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan per Sales</CardTitle>
            </CardHeader>
            <CardContent>
                <Chart
                    type="pie"
                    height={300}
                    series={data.values}
                    options={{
                        labels: data.labels,
                        legend: { position: "bottom" },
                    }}
                />
            </CardContent>
        </Card>
    )
}
