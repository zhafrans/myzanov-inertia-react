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

    return (
        <header className="h-14 border-b bg-card px-6 flex items-center justify-between">
            {/* LEFT: TOGGLE SIDEBAR */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
            >
                <Menu className="w-5 h-5" />
            </Button>

            {/* RIGHT: USER MENU */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                        <AvatarFallback>
                            {user?.name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => router.post(route("logout"))}
                        className="text-red-600"
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
