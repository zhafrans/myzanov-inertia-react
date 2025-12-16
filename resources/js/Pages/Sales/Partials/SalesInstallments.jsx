import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const dummyInstallments = [
    {
        number: 1,
        date: "08-06-2023",
        amount: 225000,
        collector: "ATI",
    },
]

export default function SalesInstallments() {
    const totalCards = Math.max(5, dummyInstallments.length)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: totalCards }).map((_, i) => {
                const item = dummyInstallments[i]

                return (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle>Angsuran {i + 1}</CardTitle>
                        </CardHeader>

                        <CardContent className="text-sm space-y-1">
                            {item ? (
                                <>
                                    <p>Tanggal: {item.date}</p>
                                    <p>
                                        Nominal: Rp{" "}
                                        {item.amount.toLocaleString()}
                                    </p>
                                    <p>Collector: {item.collector}</p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">-</p>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
