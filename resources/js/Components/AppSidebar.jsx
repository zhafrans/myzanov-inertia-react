import { Link, usePage } from "@inertiajs/react"
import { LayoutDashboard, Users, BarChart, Clock, Group, Users2, User, CircleDashed, Banknote } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/Contexts/SidebarContext"
import clsx from "clsx"

export default function AppSidebar() {
    const { url } = usePage()
    const { open } = useSidebar()

    const menu = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Sales", href: "/sales", icon: Banknote },
        { label: "Users", href: "/users", icon: Users },
        { label: "Activity Logs", href: "/activity-logs", icon: Clock },
        { label: "Reports", href: "/reports", icon: BarChart },
    ]

    return (
        <aside
            className={clsx(
                "border-r bg-card transition-all duration-300",
                open ? "w-64" : "w-16"
            )}
        >
            {/* LOGO */}
            <div className="h-14 flex items-center px-4 font-bold overflow-hidden">
                {open && "Sales Monitor"}
            </div>

            <Separator />

            <nav className="p-2 space-y-1">
                {menu.map(item => {
                    const active = url.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted",
                                !open && "justify-center"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {open && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
