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
    MessageCircle,
    Calendar,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/Contexts/SidebarContext";
import clsx from "clsx";
import { useState } from "react";
import logo from "../Public/Images/myzanovweb.png";

export default function AppSidebar() {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const { open } = useSidebar();
    const [collectorMenuOpen, setCollectorMenuOpen] = useState(
        url.startsWith("/collector")
    );

    const menu = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            roles: ["SUPER_ADMIN", "ADMIN", "DRIVER", "COLLECTOR"],
        },
        {
            label: "Sales",
            href: "/sales",
            icon: Banknote,
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            label: "Users",
            href: "/users",
            icon: Users,
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            label: "Products",
            href: "/products",
            icon: Footprints,
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            label: "Landing Page",
            href: "/landing-page",
            icon: Globe,
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            label: "Activity Logs",
            href: "/activity-logs",
            icon: Clock,
            roles: ["SUPER_ADMIN"],
        },
        {
            label: "WhatsApp Session",
            href: "/whatsapp-session",
            icon: MessageCircle,
            roles: ["SUPER_ADMIN"],
        },
        {
            label: "WhatsApp Schedules",
            href: "/wa-schedules",
            icon: Calendar,
            roles: ["SUPER_ADMIN"],
        },
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

    // Filter menu berdasarkan role user
    const filteredMenu = menu.filter((item) => {
        return (
            user?.role === "SUPER_ADMIN" ||
            (item.roles && item.roles.includes(user?.role))
        );
    });

    // Cek apakah user memiliki akses collector
    const hasCollectorAccess =
        user?.role === "SUPER_ADMIN" ||
        user?.role === "COLLECTOR" ||
        user?.role === "ADMIN";

    return (
        <aside
            className={clsx(
                "hidden md:block border-r bg-card transition-all duration-300",
                open ? "w-64" : "w-16"
            )}
        >
            {/* LOGO */}
            <div className="h-14 flex items-center px-4 font-bold overflow-hidden">
                {open && (
                    <img
                        src={logo}
                        alt="Sales Monitor"
                        className="h-10 w-auto"
                    />
                )}
            </div>

            <Separator />

            <nav className="p-2 space-y-1">
                {/* Menu utama (ketika sidebar terbuka) */}
                {filteredMenu.map((item) => {
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
                            title={!open ? item.label : ""}
                        >
                            <Icon className="w-5 h-5" />
                            {open && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                {/* Collector Menu dengan Submenu (ketika sidebar terbuka) */}
                {open && hasCollectorAccess && (
                    <div className="space-y-1">
                        <button
                            onClick={() =>
                                setCollectorMenuOpen(!collectorMenuOpen)
                            }
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

                {/* Menu untuk sidebar tertutup */}
                {!open && (
                    <>
                        {/* Menu utama dalam mode ikon saja */}
                        {filteredMenu.map((item) => {
                            const active = url.startsWith(item.href);
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

                        {/* Collector submenu dalam mode ikon saja (hanya untuk user dengan akses) */}
                        {hasCollectorAccess &&
                            collectorSubmenu.map((item) => {
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
                    </>
                )}
            </nav>
        </aside>
    );
}
