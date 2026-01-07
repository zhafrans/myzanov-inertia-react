import { Link, usePage, router } from "@inertiajs/react";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    Clock,
    Banknote,
    Footprints,
    Globe,
    Receipt,
    AlertCircle,
    MoreHorizontal,
    User,
    LogOut,
    MessageCircle,
    Settings,
    Calendar,
    BarChart3,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function MobileBottomNav() {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [collectorMenuOpen, setCollectorMenuOpen] = useState(false);
    const [miscMenuOpen, setMiscMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        router.post(route("logout"));
    };

    // Close sheets when URL changes (navigation)
    useEffect(() => {
        setCollectorMenuOpen(false);
        setMiscMenuOpen(false);
        setProfileOpen(false);
    }, [url]);

    const mainMenu = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            roles: ["SUPER_ADMIN"],
        },
        {
            label: "Sales",
            href: "/sales",
            icon: Banknote,
            roles: ["SUPER_ADMIN", "ADMIN", "COLLECTOR"],
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
    ];

    const collectorSubmenu = [
        {
            label: "Riwayat Tagihan",
            href: "/collector",
            icon: Receipt,
        },
        {
            label: "Belum Tertagih",
            href: "/collector/uncollected",
            icon: AlertCircle,
        },
        {
            label: "Statistik kartu",
            href: "/collector/card-statistics",
            icon: BarChart3,
        },
        {
            label: "Collector Data",
            href: "/collector/data",
            icon: Banknote,
        },
    ];

    const miscSubmenu = [
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

    // Helper function to check if user has access
    const hasAccess = (allowedRoles) => {
        if (!user?.role) return false;
        return allowedRoles.includes(user.role);
    };

    // Get filtered misc submenu based on user role
    const getFilteredMiscSubmenu = () => {
        if (!user?.role) return [];
        return miscSubmenu.filter((item) => hasAccess(item.roles || []));
    };

    // Get filtered collector submenu based on user role
    const getFilteredCollectorSubmenu = () => {
        if (!user?.role) return [];
        // Only show collector menu for SUPER_ADMIN and COLLECTOR
        if (user.role === "SUPER_ADMIN" || user.role === "COLLECTOR") {
            return collectorSubmenu;
        }
        return [];
    };

    // Get main menu items - filtered based on user role
    const getMenuItems = () => {
        if (!user?.role) return [];

        const filteredMenu = [];

        // Filter and add regular menu items
        mainMenu.forEach((item) => {
            if (hasAccess(item.roles)) {
                filteredMenu.push({
                    ...item,
                    isSheet: false,
                    isAvatar: false,
                });
            }
        });

        // Collector sheet - only for SUPER_ADMIN and COLLECTOR
        if (user.role === "SUPER_ADMIN" || user.role === "COLLECTOR") {
            filteredMenu.push({
                label: "Collector",
                href: "#",
                icon: Receipt,
                isSheet: true,
                isAvatar: false,
            });
        }

        // Misc sheet - only show if user has access to at least one misc item
        const filteredMiscItems = getFilteredMiscSubmenu();
        if (filteredMiscItems.length > 0) {
            filteredMenu.push({
                label: "Misc",
                href: "#",
                icon: MoreHorizontal,
                isSheet: true,
                isAvatar: false,
            });
        }

        // Profile avatar - always show
        filteredMenu.push({
            label: "Profile",
            href: "#",
            icon: null,
            isSheet: false,
            isAvatar: true,
        });

        return filteredMenu;
    };

    const menuItems = getMenuItems();
    const filteredMiscSubmenu = getFilteredMiscSubmenu();
    const filteredCollectorSubmenu = getFilteredCollectorSubmenu();

    // Check if item is active
    const isActive = (href) => {
        if (href === "#") return false;
        return url === href;
    };

    const handleMenuClick = (e, item) => {
        if (item.isSheet) {
            e.preventDefault();
            // Determine which sheet to open based on label
            if (item.label === "Collector") {
                setCollectorMenuOpen(true);
            } else if (item.label === "Misc") {
                setMiscMenuOpen(true);
            }
        } else if (item.isAvatar) {
            e.preventDefault();
            setProfileOpen(true);
        }
    };

    const handleSubmenuClick = (e, href) => {
        e.preventDefault();
        setCollectorMenuOpen(false);
        setMiscMenuOpen(false);
        router.visit(href);
    };

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
                <div className="flex items-center justify-around h-16 px-1">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        // Shorten label for mobile
                        const shortLabel = item.label.split(" ")[0];

                        if (item.isAvatar) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={(e) => handleMenuClick(e, item)}
                                    className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0"
                                >
                                    <Avatar className="w-6 h-6">
                                        {user?.profile_image_url && (
                                            <AvatarImage
                                                src={user.profile_image_url}
                                                alt={user?.name}
                                            />
                                        )}
                                        <AvatarFallback className="text-[10px]">
                                            {user?.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-medium leading-tight text-center px-0.5 truncate w-full">
                                        {user?.name?.split(" ")[0]}
                                    </span>
                                </button>
                            );
                        }

                        if (item.isSheet) {
                            // Check if any submenu item is active for highlighting
                            const isSubmenuActive = (() => {
                                if (item.label === "Collector") {
                                    return filteredCollectorSubmenu.some(
                                        (subItem) =>
                                            url === subItem.href ||
                                            url.startsWith(subItem.href + "/")
                                    );
                                }
                                if (item.label === "Misc") {
                                    return filteredMiscSubmenu.some(
                                        (subItem) =>
                                            url === subItem.href ||
                                            url.startsWith(subItem.href + "/")
                                    );
                                }
                                return false;
                            })();

                            return (
                                <button
                                    key={item.label}
                                    onClick={(e) => handleMenuClick(e, item)}
                                    className={clsx(
                                        "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0",
                                        isSubmenuActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            "w-5 h-5",
                                            isSubmenuActive && "scale-110"
                                        )}
                                    />
                                    <span className="text-[10px] font-medium leading-tight text-center px-0.5">
                                        {shortLabel}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0",
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon
                                    className={clsx(
                                        "w-5 h-5",
                                        active && "scale-110"
                                    )}
                                />
                                <span className="text-[10px] font-medium leading-tight text-center px-0.5">
                                    {shortLabel}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Collector Submenu Sheet (Slide from bottom) */}
            <Sheet open={collectorMenuOpen} onOpenChange={setCollectorMenuOpen}>
                <SheetContent
                    side="bottom"
                    className="h-auto max-h-[80vh] rounded-t-xl"
                >
                    <SheetHeader>
                        <SheetTitle>Menu Collector</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2 py-4">
                        {filteredCollectorSubmenu.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <button
                                    key={item.href}
                                    onClick={(e) => handleSubmenuClick(e, item.href)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Miscellaneous Submenu Sheet (Slide from bottom) */}
            <Sheet open={miscMenuOpen} onOpenChange={setMiscMenuOpen}>
                <SheetContent
                    side="bottom"
                    className="h-auto max-h-[80vh] rounded-t-xl"
                >
                    <SheetHeader>
                        <SheetTitle>Miscellaneous</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2 py-4">
                        {filteredMiscSubmenu.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <button
                                    key={item.href}
                                    onClick={(e) => handleSubmenuClick(e, item.href)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 p-4 rounded-lg transition-colors text-left",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Profile Sheet (Slide from bottom) */}
            <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                <SheetContent
                    side="bottom"
                    className="h-auto max-h-[80vh] rounded-t-xl"
                >
                    <SheetHeader>
                        <SheetTitle>Profile</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                        {/* User Info */}
                        <div className="flex flex-col items-center py-4 space-y-3">
                            <Avatar className="w-20 h-20">
                                {user?.profile_image_url && (
                                    <AvatarImage
                                        src={user.profile_image_url}
                                        alt={user?.name}
                                    />
                                )}
                                <AvatarFallback className="text-2xl">
                                    {user?.name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-center space-y-1">
                                <p className="text-lg font-semibold">
                                    {user?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email}
                                </p>
                                {user?.role && (
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {user.role}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Menu Items */}
                        <div className="space-y-2">
                            <Link
                                href={route("users.show", user?.id)}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 p-4 rounded-lg transition-colors hover:bg-muted"
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">
                                    Lihat Profil
                                </span>
                            </Link>

                            <Link
                                href={route("profile.edit")}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 p-4 rounded-lg transition-colors hover:bg-muted"
                            >
                                <Settings className="w-5 h-5" />
                                <span className="font-medium">Pengaturan</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setProfileOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-3 p-4 rounded-lg transition-colors hover:bg-muted text-red-600 w-full text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
