import { Link, router } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { useSidebar } from "@/Contexts/SidebarContext";

export default function AppNavbar({ user }) {
    const { toggle } = useSidebar();

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <>
            <header className="hidden md:flex h-14 border-b bg-card px-6 items-center justify-between">
                {/* LEFT: TOGGLE SIDEBAR - Hidden on mobile, but keep space */}
                <div className="flex items-center w-10 md:w-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="hidden md:flex"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                {/* RIGHT: USER MENU - Desktop only */}
                <div className="flex items-center ml-auto">
                    {/* Desktop: Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                                <span className="text-sm font-medium">
                                    Hai! {user?.name}
                                </span>
                                <Avatar className="hidden md:flex">
                                    {user?.profile_image_url && (
                                        <AvatarImage
                                            src={user.profile_image_url}
                                            alt={user?.name}
                                        />
                                    )}
                                    <AvatarFallback>
                                        {user?.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                    {user?.role && (
                                        <p className="text-xs leading-none text-muted-foreground capitalize">
                                            {user.role}
                                        </p>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route("users.show", user?.id || "")}
                                    className="cursor-pointer w-full flex items-center"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Lihat Profil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route("profile.edit")}
                                    className="cursor-pointer w-full flex items-center"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Pengaturan</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600 cursor-pointer focus:text-red-600"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </>
    );
}
