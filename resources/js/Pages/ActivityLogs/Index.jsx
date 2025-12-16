import AppLayout from "@/Layouts/AppLayout"
import ActivityLogsTable from "./Partials/ActivityLogsTable"

export default function ActivityLogsIndex() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Activity Logs</h1>
            <ActivityLogsTable />
        </div>
    )
}

ActivityLogsIndex.layout = page => (
    <AppLayout title="Activity Logs">
        {page}
    </AppLayout>
)
