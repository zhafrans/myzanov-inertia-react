import { Head, usePage } from "@inertiajs/react"
import AppSidebar from "@/Components/AppSidebar"
import AppNavbar from "@/Components/AppNavbar"
import { SidebarProvider } from "@/Contexts/SidebarContext"

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props

    return (
        <SidebarProvider>
            <Head title={title ?? "Dashboard"} />

            <div className="flex min-h-screen bg-background">
                <AppSidebar />

                <div className="flex-1 flex flex-col">
                    <AppNavbar user={auth.user} />

                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
