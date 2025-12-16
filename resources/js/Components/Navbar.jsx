import { router } from "@inertiajs/react"

export default function Navbar({ user }) {
    return (
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
            <span className="font-semibold">
                Hi, {user?.name}
            </span>

            <button
                onClick={() => router.post(route("logout"))}
                className="text-sm text-red-600"
            >
                Logout
            </button>
        </header>
    )
}
