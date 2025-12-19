import AppLayout from "@/Layouts/AppLayout"
import ActivityLogsTable from "./Partials/ActivityLogsTable"
import FilterForm from "./Partials/FilterForm"
import { Head } from "@inertiajs/react"

import { useState } from "react"

export default function ActivityLogsIndex({ logs, filters, filterOptions }) {
    const [loading, setLoading] = useState(false)

    return (
        <div className="space-y-6">
            <Head title="Activity Logs" />
            
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Activity Logs</h1>
            </div>

            <FilterForm 
                filters={filters} 
                users={filterOptions.users} 
                actions={filterOptions.actions} 
                modules={filterOptions.modules}
                setLoading={setLoading}
            />

            <ActivityLogsTable logs={logs} loading={loading} />
        </div>
    )
}

ActivityLogsIndex.layout = page => (
    <AppLayout title="Activity Logs">
        {page}
    </AppLayout>
)