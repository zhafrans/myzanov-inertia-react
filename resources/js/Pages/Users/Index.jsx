import AppLayout from "@/Layouts/AppLayout"
import UsersTable from "./Partials/UsersTable"

export default function UsersIndex() {
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Users</h1>
            <UsersTable />
        </div>
    )
}

UsersIndex.layout = page => (
    <AppLayout title="Users">
        {page}
    </AppLayout>
)
