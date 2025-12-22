import { Head, usePage } from "@inertiajs/react"
import AppSidebar from "@/Components/AppSidebar"
import AppNavbar from "@/Components/AppNavbar"
import MobileBottomNav from "@/Components/MobileBottomNav"
import { SidebarProvider } from "@/Contexts/SidebarContext"

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props

    return (
        <SidebarProvider>
            <Head title={title ?? "Dashboard"} />

            <div className="flex min-h-screen bg-background overflow-x-hidden">
                <AppSidebar />

                <div className="flex-1 flex flex-col md:pb-0 pb-16 overflow-x-hidden">
                    <AppNavbar user={auth.user} />

                    <main className="flex-1 p-6 md:p-6 pb-2 md:pb-6 overflow-x-hidden">
                        {children}
                    </main>
                </div>

                <MobileBottomNav />
            </div>
        </SidebarProvider>
    )
}
