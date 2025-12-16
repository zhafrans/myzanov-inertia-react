import { Card, CardContent } from "@/components/ui/card"

export default function SummaryCards({ stats }) {
    const items = [
        { label: "Total Tanggungan", value: stats.totalTanggungan },
        { label: "Total Terjual", value: stats.totalTerjual },
        { label: "Total Kartu Belum Lunas", value: stats.belumLunas },
        { label: "Total Sudah Lunas", value: stats.sudahLunas },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(item => (
                <Card key={item.label}>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">
                            {item.label}
                        </p>
                        <h2 className="text-2xl font-bold mt-1">
                            {item.value}
                        </h2>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
