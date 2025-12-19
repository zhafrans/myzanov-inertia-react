import AppLayout from "@/Layouts/AppLayout"
import UsersTable from "./Partials/UsersTable"

export default function UsersIndex({ users, filters, sort }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-muted-foreground">
                    Kelola data pengguna dan hak akses
                </p>
            </div>

            <UsersTable 
                users={users}
                filters={filters}
                sort={sort}
            />
        </div>
    )
}

// Layout wrapper
UsersIndex.layout = page => (
    <AppLayout title="Users">
        {page}
    </AppLayout>
)
