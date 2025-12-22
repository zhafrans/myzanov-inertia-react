import AppLayout from "@/Layouts/AppLayout"
import UserInfoCard from "./Partials/UserInfoCard"
import SalesPerformance from "./Partials/SalesPerformance"

export default function UserShow({ user, performance, filters = {} }) {
    return (
        <div className="space-y-6">
            <UserInfoCard user={user} />
            <SalesPerformance 
                performance={performance} 
                filters={filters}
                userId={user?.id}
            />
        </div>
    )
}

UserShow.layout = page => (
    <AppLayout title="User Detail">
        {page}
    </AppLayout>
)
