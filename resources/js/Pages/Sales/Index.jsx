import AppLayout from "@/Layouts/AppLayout"
import SalesToolbar from "./Partials/SalesToolbar"
import SalesTable from "./Partials/SalesTable"

export default function SalesIndex() {
    return (
        <div className="space-y-4">
            <SalesToolbar />
            <SalesTable />
        </div>
    )
}

SalesIndex.layout = page => (
    <AppLayout title="Sales">
        {page}
    </AppLayout>
)
