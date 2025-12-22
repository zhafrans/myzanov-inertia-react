import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu, X, Facebook, Instagram, Twitter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPageLayout({ children, title, footer }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url, props } = usePage();
    const user = props.auth?.user;

    const navItems = [
        { name: "Home", href: route("landing.home") },
        { name: "Catalogue", href: route("landing.catalogue") },
        { name: "About", href: route("landing.about") },
        { name: "Contact", href: route("landing.contact") },
    ];

    if (user) {
        navItems.push(
            { name: `Hai, ${user.name}`, href: route("dashboard.index") },
            { name: "Logout", href: route("logout"), method: "post" },
        );
    } else {
        navItems.push({ name: "Login", href: route("login") });
    }

    return (
        <>
            <Head title={title ?? "ZANOV SHOES"} />

            <div className="min-h-screen flex flex-col">

                {/* Navbar */}
                <motion.nav
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-black text-white sticky top-0 z-50 shadow-lg"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">

                            {/* Logo */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href={route("landing.home")} className="flex items-center">
                                    <span className="text-2xl font-bold" style={{ color: "#FF5C00" }}>
                                        ZANOV
                                    </span>
                                </Link>
                            </motion.div>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex space-x-8">
                                {navItems.map((item, index) => {
                                    const isActive = url === item.href;

                                    return (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                href={item.href}
                                                method={item.method}
                                                as={item.method ? "button" : "a"}
                                                className="hover:text-orange-500 transition-colors duration-200"
                                                style={{
                                                    color: item.method
                                                        ? "white"
                                                        : isActive
                                                        ? "#FF5C00"
                                                        : "white",
                                                }}
                                            >
                                                {item.name}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden bg-black border-t border-gray-800 overflow-hidden"
                            >
                                <div className="px-2 pt-2 pb-3 space-y-1">
                                    {navItems.map((item, index) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                href={item.href}
                                                method={item.method}
                                                as={item.method ? "button" : "a"}
                                                className="block px-3 py-2 hover:bg-gray-900 rounded-md"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.nav>

                {/* Main Content */}
                <main className="flex-1">{children}</main>

                {/* Footer */}
                {/* (footer bagianmu tetap, tidak aku ubah) */}
            </div>
        </>
    );
}
