import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import PerformanceSummary from "./PerformanceSummary"
import TopRankingCard from "./TopRankingCard"
import { router } from "@inertiajs/react"
import { useState, useEffect } from "react"

export default function SalesPerformance({ performance, filters = {}, userId }) {
    // Default: bulan ini
    const getDefaultDateRange = () => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return {
            start_date: startOfMonth.toISOString().split("T")[0],
            end_date: endOfMonth.toISOString().split("T")[0],
        }
    }

    const defaultRange = getDefaultDateRange()
    const [startDate, setStartDate] = useState(filters.start_date || defaultRange.start_date)
    const [endDate, setEndDate] = useState(filters.end_date || defaultRange.end_date)
    const [isAllTime, setIsAllTime] = useState(filters.all_time || false)

    // State untuk limit setiap top card (default 5)
    const [limits, setLimits] = useState({
        topProducts: 5,
        topSizes: 5,
        topCities: 5,
        topSubdistricts: 5,
    })

    // State untuk loading per card
    const [cardLoading, setCardLoading] = useState({
        topProducts: false,
        topSizes: false,
        topCities: false,
        topSubdistricts: false,
    })

    // Initialize limits dari data length saat pertama kali load
    useEffect(() => {
        if (performance && limits.topProducts === 5 && limits.topSizes === 5 && limits.topCities === 5 && limits.topSubdistricts === 5) {
            setLimits({
                topProducts: performance.topProducts?.length || 5,
                topSizes: performance.topSizes?.length || 5,
                topCities: performance.topCities?.length || 5,
                topSubdistricts: performance.topSubdistricts?.length || 5,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performance])

    const handleFilter = () => {
        setIsAllTime(false)
        const params = {}
        if (startDate) params.start_date = startDate
        if (endDate) params.end_date = endDate
        
        // Reset limits saat filter berubah
        setLimits({
            topProducts: 5,
            topSizes: 5,
            topCities: 5,
            topSubdistricts: 5,
        })

        router.get(route("users.show", userId), params, {
            preserveState: true,
            replace: true,
        })
    }

    const handleResetFilter = () => {
        const defaultRange = getDefaultDateRange()
        setStartDate(defaultRange.start_date)
        setEndDate(defaultRange.end_date)
        setIsAllTime(false)
        
        // Reset limits
        setLimits({
            topProducts: 5,
            topSizes: 5,
            topCities: 5,
            topSubdistricts: 5,
        })

        router.get(route("users.show", userId), {
            start_date: defaultRange.start_date,
            end_date: defaultRange.end_date,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleAllTime = () => {
        setIsAllTime(true)
        
        // Reset limits
        setLimits({
            topProducts: 5,
            topSizes: 5,
            topCities: 5,
            topSubdistricts: 5,
        })

        router.get(route("users.show", userId), {
            all_time: true,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleLoadMore = (cardType) => {
        const newLimit = limits[cardType] + 5

        // Set loading untuk card ini saja
        setCardLoading((prev) => ({
            ...prev,
            [cardType]: true,
        }))

        const params = {}
        if (isAllTime) {
            params.all_time = true
        } else {
            if (startDate) params.start_date = startDate
            if (endDate) params.end_date = endDate
        }

        // Map cardType ke parameter limit
        const limitParams = {
            topProducts: 'top_product_limit',
            topSizes: 'top_size_limit',
            topCities: 'top_city_limit',
            topSubdistricts: 'top_subdistrict_limit',
        }

        params[limitParams[cardType]] = newLimit

        router.get(route("users.show", userId), params, {
            preserveState: true,
            replace: true,
            onSuccess: () => {
                // Update limit berdasarkan data yang baru setelah fetch
                setLimits((prev) => ({
                    ...prev,
                    [cardType]: newLimit,
                }))
                setCardLoading((prev) => ({
                    ...prev,
                    [cardType]: false,
                }))
            },
            onFinish: () => {
                setCardLoading((prev) => ({
                    ...prev,
                    [cardType]: false,
                }))
            },
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle>Performa Sales</CardTitle>
                    <div className="space-y-3">
                        {/* Date Inputs - Stack di mobile, side by side di desktop */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Dari tanggal"
                                disabled={isAllTime}
                                className="w-full sm:flex-1"
                            />
                            <Input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Sampai tanggal"
                                disabled={isAllTime}
                                className="w-full sm:flex-1"
                            />
                        </div>
                        {/* Buttons - Wrap dengan flex */}
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                onClick={handleFilter} 
                                size="sm" 
                                disabled={isAllTime}
                                className="flex-1 sm:flex-initial"
                            >
                                Filter
                            </Button>
                            <Button 
                                onClick={handleResetFilter} 
                                variant="outline" 
                                size="sm" 
                                disabled={isAllTime}
                                className="flex-1 sm:flex-initial"
                            >
                                Reset
                            </Button>
                            <Button
                                variant={isAllTime ? "default" : "secondary"}
                                onClick={handleAllTime}
                                size="sm"
                                className="flex-1 sm:flex-initial"
                            >
                                All Time
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <PerformanceSummary performance={performance} />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <TopRankingCard 
                    title="Top Product" 
                    data={performance?.topProducts || []}
                    loading={cardLoading.topProducts}
                    onLoadMore={() => handleLoadMore("topProducts")}
                    currentLimit={limits.topProducts}
                />
                <TopRankingCard 
                    title="Top Size" 
                    data={performance?.topSizes || []}
                    loading={cardLoading.topSizes}
                    onLoadMore={() => handleLoadMore("topSizes")}
                    currentLimit={limits.topSizes}
                />
                <TopRankingCard 
                    title="Top City" 
                    data={performance?.topCities || []}
                    loading={cardLoading.topCities}
                    onLoadMore={() => handleLoadMore("topCities")}
                    currentLimit={limits.topCities}
                />
                <TopRankingCard 
                    title="Top Subdistrict" 
                    data={performance?.topSubdistricts || []}
                    loading={cardLoading.topSubdistricts}
                    onLoadMore={() => handleLoadMore("topSubdistricts")}
                    currentLimit={limits.topSubdistricts}
                />
            </div>
        </div>
    )
}
