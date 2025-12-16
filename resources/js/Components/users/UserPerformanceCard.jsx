import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import VerticalBarChartApex from "@/Components/charts/VerticalBarChart"
import { useMemo } from "react"

function groupCount(data, key) {
    const map = {}

    data.forEach(item => {
        map[item[key]] = (map[item[key]] || 0) + 1
    })

    return Object.entries(map)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
}

export default function UserPerformanceCard({ sales, range }) {
    const filteredSales = useMemo(() => {
        return sales.filter(s => {
            const d = new Date(s.date)
            return d >= range.from && d <= range.to
        })
    }, [sales, range])

    const topProduct = useMemo(
        () => groupCount(filteredSales, "product"),
        [filteredSales]
    )

    const topSize = useMemo(
        () => groupCount(filteredSales, "size"),
        [filteredSales]
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performa Sales</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* SUMMARY */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <Summary label="Produk Terjual" value={filteredSales.length} />
                    <Summary
                        label="Lunas"
                        value={filteredSales.filter(s => s.remaining === 0).length}
                    />
                    <Summary
                        label="Belum Lunas"
                        value={filteredSales.filter(s => s.remaining > 0).length}
                    />
                </div>

                {/* TOP PRODUCT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <VerticalBarChartApex
                        title="Top Product"
                        data={topProduct.slice(0, 5)}
                    />

                    <VerticalBarChartApex
                        title="Top Size"
                        data={topSize.slice(0, 5)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

function Summary({ label, value }) {
    return (
        <div className="border rounded-lg p-4">
            <p className="text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    )
}
