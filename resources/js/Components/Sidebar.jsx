import { Link, usePage } from "@inertiajs/react"

export default function Sidebar({ user }) {
    const { url } = usePage()

    const menu = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Sales", href: "/sales" },
        { label: "Reports", href: "/reports" },
        { label: "Users", href: "/users" },
    ]

    return (
        <aside className="w-64 bg-white border-r">
            <div className="p-4 font-bold text-lg">
                Sales Monitor
            </div>

            <nav className="px-4 space-y-1">
                {menu.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2 rounded
                            ${url.startsWith(item.href)
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }
                        `}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
