import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CollectorDataStats({ statistics }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Card className="flex-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statistics.total_data_items.toLocaleString('id-ID')}</div>
                </CardContent>
            </Card>
        </div>
    )
}
