import { Link, usePage, router } from "@inertiajs/react";
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
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
            label: "Belum Tertagih",
            href: "/collector/uncollected",
            icon: AlertCircle,
        },
    ];

    const miscSubmenu = [
        { label: "Users", href: "/users", icon: Users },
        { label: "Products", href: "/products", icon: Footprints },
        { label: "Landing Page", href: "/landing-page", icon: Globe },
        { label: "Activity Logs", href: "/activity-logs", icon: Clock },
    ];

    // Get menu items - always the same for all pages
    const getMenuItems = () => {
        // Always show the same menu: Dashboard, Sales, Collector (sheet), Miscellaneous (sheet), Avatar
        return [
            menu[0], // Dashboard
            menu[1], // Sales
            { label: "Collector", href: "#", icon: Receipt, isSheet: true }, // Collector (opens sheet)
            { label: "Misc", href: "#", icon: MoreHorizontal, isSheet: true }, // Miscellaneous (opens sheet)
            { label: "Profile", href: "#", icon: null, isAvatar: true }, // Avatar (opens profile dialog)
        ];
    };

    const menuItems = getMenuItems();

    // Check if item is active
    const isActive = (href) => {
        if (href === "/collector") {
            return url.startsWith("/collector") && url !== "/collector/uncollected";
        }
        if (href === "#") return false;
        return url === href || url.startsWith(href + "/");
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
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-xs">
                                            {user?.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            );
                        }

                        if (item.isSheet) {
                            // Check if any submenu item is active for highlighting
                            const isSubmenuActive = item.label === "Collector" 
                                ? url.startsWith("/collector")
                                : item.label === "Misc"
                                ? url.startsWith("/users") || url.startsWith("/products") || url.startsWith("/landing-page") || url.startsWith("/activity-logs")
                                : false;

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
                                    <Icon className={clsx(
                                        "w-5 h-5",
                                        isSubmenuActive && "scale-110"
                                    )} />
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
                                <Icon className={clsx(
                                    "w-5 h-5",
                                    active && "scale-110"
                                )} />
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
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl">
                    <SheetHeader>
                        <SheetTitle>Menu Collector</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2 py-4">
                        {collectorSubmenu.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setCollectorMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 p-4 rounded-lg transition-colors",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Miscellaneous Submenu Sheet (Slide from bottom) */}
            <Sheet open={miscMenuOpen} onOpenChange={setMiscMenuOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl">
                    <SheetHeader>
                        <SheetTitle>Miscellaneous</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2 py-4">
                        {miscSubmenu.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMiscMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 p-4 rounded-lg transition-colors",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Profile Dialog for Mobile */}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Profile</DialogTitle>
                        <DialogDescription>
                            Informasi akun Anda
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center py-4 space-y-4">
                        <Avatar className="w-20 h-20">
                            <AvatarFallback className="text-2xl">
                                {user?.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center space-y-1">
                            <p className="text-lg font-semibold">{user?.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {user?.email}
                            </p>
                            {user?.role && (
                                <p className="text-xs text-muted-foreground">
                                    {user.role}
                                </p>
                            )}
                        </div>

                        <Separator />

                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

