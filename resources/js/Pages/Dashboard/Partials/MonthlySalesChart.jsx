import Chart from "react-apexcharts"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"

export default function MonthlySalesChart({ data }) {
    const options = {
        chart: {
            toolbar: { show: false },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        xaxis: {
            categories: data.months,
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
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Penjualan Per Bulan (Per Sales)</CardTitle>
            </CardHeader>
            <CardContent>
                <Chart
                    type="line"
                    height={320}
                    series={data.series}
                    options={options}
                />
            </CardContent>
        </Card>
    )
}
