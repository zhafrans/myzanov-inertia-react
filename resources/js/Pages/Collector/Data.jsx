import AppLayout from "@/Layouts/AppLayout"
import CollectorDataStats from "./Partials/CollectorDataStats"
import CollectorDataTable from "./Partials/CollectorDataTable"
import CollectorDataFilter from "./Partials/CollectorDataFilter"
import { useState, useEffect } from "react"
import { router, usePage } from "@inertiajs/react"

export default function CollectorData({ sales, sellers, filters, statistics }) {
    const { url } = usePage()
    const [currentFilters, setCurrentFilters] = useState(filters)

    const handleFilterChange = (newFilters) => {
        setCurrentFilters(newFilters)
        router.get(url, newFilters, {
            preserveState: true,
            replace: true,
        })
    }

    const handleResetFilter = () => {
        const resetFilters = {
            search: '',
            payment_type: 'all',
            seller_id: 'all',
            status: 'all',
            province_id: '',
            city_id: '',
            subdistrict_id: '',
            village_id: '',
            startDate: '',
            endDate: '',
            all_time: false
        }
        setCurrentFilters(resetFilters)
        router.get(url, resetFilters, {
            preserveState: true,
            replace: true,
        })
    }

    return (
        <div className="space-y-4">
            <CollectorDataStats 
                statistics={statistics} 
            />
            <CollectorDataFilter 
                onFilterChange={handleFilterChange} 
                sellers={sellers}
                initialFilters={filters}
            />
            <CollectorDataTable sales={sales} />
        </div>
    )
}

CollectorData.layout = page => (
    <AppLayout title="Collector Data">
        {page}
    </AppLayout>
)
