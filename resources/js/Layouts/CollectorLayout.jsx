import { Head, usePage } from "@inertiajs/react";
import AppSidebar from "@/Components/AppSidebar";
import AppNavbar from "@/Components/AppNavbar";
import MobileBottomNav from "@/Components/MobileBottomNav";
import { SidebarProvider } from "@/Contexts/SidebarContext";

export default function CollectorLayout({ children, title }) {
    const { auth } = usePage().props;

    return (
        <SidebarProvider>
            <Head title={title ?? "Collector"} />

            <div className="flex min-h-screen bg-background">
                <AppSidebar />

                <div className="flex-1 flex flex-col md:pb-0 pb-16">
                    <AppNavbar user={auth.user} />

                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>

                <MobileBottomNav />
            </div>
        </SidebarProvider>
    );
}

