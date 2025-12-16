import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const dummyRanking = [
    { label: "A551", value: 40 },
    { label: "A552", value: 30 },
    { label: "A553", value: 20 },
]

export default function TopRankingCard({ title }) {
    const max = Math.max(...dummyRanking.map(i => i.value))

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {dummyRanking.map((item, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm">
                            <span>
                                #{i + 1} {item.label}
                            </span>
                            <span>{item.value}</span>
                        </div>
                        <div className="h-2 bg-muted rounded">
                            <div
                                className="h-2 bg-primary rounded"
                                style={{
                                    width: `${(item.value / max) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
