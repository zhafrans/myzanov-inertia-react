import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import PerformanceSummary from "./PerformanceSummary"
import TopRankingCard from "./TopRankingCard"

export default function SalesPerformance() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row justify-between">
                    <CardTitle>Performa Sales</CardTitle>
                    <div className="flex gap-2">
                        <Input type="date" />
                        <Input type="date" />
                    </div>
                </CardHeader>

                <CardContent>
                    <PerformanceSummary />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <TopRankingCard title="Top Product" />
                <TopRankingCard title="Top Size" />
                <TopRankingCard title="Top City" />
                <TopRankingCard title="Top Subdistrict" />
            </div>
        </div>
    )
}
