import { router } from "@inertiajs/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useSidebar } from "@/Contexts/SidebarContext"

export default function AppNavbar({ user }) {
    const { toggle } = useSidebar()

    const handleLogout = () => {
        router.post(route("logout"))
    }

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
                            <Avatar className="cursor-pointer hidden md:flex">
                                <AvatarFallback>
                                    {user?.name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </>
    )
}
