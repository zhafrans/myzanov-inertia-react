import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Users,
    BarChart,
    Clock,
    Group,
    Users2,
    User,
    CircleDashed,
    Banknote,
    Footprints,
    Globe,
    Receipt,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/Contexts/SidebarContext";
import clsx from "clsx";
import { useState } from "react";

export default function AppSidebar() {
    const { url } = usePage();
    const { open } = useSidebar();
    const [collectorMenuOpen, setCollectorMenuOpen] = useState(
        url.startsWith("/collector")
    );

    const menu = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Sales", href: "/sales", icon: Banknote },
        { label: "Users", href: "/users", icon: Users },
        { label: "Products", href: "/products", icon: Footprints },
        { label: "Landing Page", href: "/landing-page", icon: Globe },
        { label: "Activity Logs", href: "/activity-logs", icon: Clock },
    ];

    const collectorSubmenu = [
        {
            label: "Riwayat Tagihan",
            href: "/collector",
            icon: Receipt,
        },
        {
            label: "Belum Tertagih Bulan Ini",
            href: "/collector/uncollected",
            icon: AlertCircle,
        },
    ];

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
                {menu.map((item) => {
                    const active = url.startsWith(item.href);
                    const Icon = item.icon;

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
                    );
                })}

                {/* Collector Menu dengan Submenu */}
                {open && (
                    <div className="space-y-1">
                        <button
                            onClick={() => setCollectorMenuOpen(!collectorMenuOpen)}
                            className={clsx(
                                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition",
                                url.startsWith("/collector")
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                <span>Collector</span>
                            </div>
                            <ChevronRight
                                className={clsx(
                                    "w-4 h-4 transition-transform",
                                    collectorMenuOpen && "rotate-90"
                                )}
                            />
                        </button>

                        {collectorMenuOpen && (
                            <div className="ml-4 space-y-1">
                                {collectorSubmenu.map((item) => {
                                    const active = url === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={clsx(
                                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
                                                active
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {!open && (
                    <div className="space-y-1">
                        {collectorSubmenu.map((item) => {
                            const active = url === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center justify-center px-3 py-2 rounded-md text-sm transition",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                    title={item.label}
                                >
                                    <Icon className="w-5 h-5" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </nav>
        </aside>
    );
}
