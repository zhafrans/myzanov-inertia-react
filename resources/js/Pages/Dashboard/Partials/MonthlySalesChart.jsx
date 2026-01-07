import Chart from "react-apexcharts"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MonthlySalesChart({ data, loading = false, totalMonthlyQuantity = 0 }) {
    // Calculate sales ranking from the series data
    const getSalesRanking = () => {
        if (!data?.series || data.series.length === 0) return [];
        
        const ranking = data.series
            .map(seller => ({
                name: seller.name,
                total: seller.data.reduce((sum, value) => sum + value, 0)
            }))
            .filter(seller => seller.total > 0); // Only include salespeople with sales > 0
        
        return ranking.sort((a, b) => b.total - a.total);
    };
    
    const salesRanking = getSalesRanking();
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
                <div className="flex justify-between items-start">
                    <CardTitle>Penjualan Per Bulan (Per Sales)</CardTitle>
                    {!loading && (
                        <div className="text-right">
                            <div className="text-sm font-medium text-muted-foreground">
                                Total Bulan Ini: <span className="text-foreground font-bold">{totalMonthlyQuantity.toLocaleString('id-ID')}</span> items
                            </div>
                            {salesRanking.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground max-h-32 overflow-y-auto">
                                    <div className="font-medium mb-1">Ranking Sales:</div>
                                    {salesRanking.map((sales, index) => (
                                        <div key={sales.name} className="flex justify-between gap-2">
                                            <span>{index + 1}. {sales.name}</span>
                                            <span className="font-medium">{sales.total.toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
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