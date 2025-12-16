import AppLayout from "@/Layouts/AppLayout"
import UserInfoCard from "./Partials/UserInfoCard"
import SalesPerformance from "./Partials/SalesPerformance"

export default function UserShow() {
    return (
        <div className="space-y-6">
            <UserInfoCard />
            <SalesPerformance />
        </div>
    )
}

UserShow.layout = page => (
    <AppLayout title="User Detail">
        {page}
    </AppLayout>
)
