import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu, X, Facebook, Instagram, Twitter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPageLayout({ children, title, footer }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url } = usePage();

    const navItems = [
        { name: "Home", href: route("landing.home") },
        { name: "Catalogue", href: route("landing.catalogue") },
        { name: "About", href: route("landing.about") },
        { name: "Contact", href: route("landing.contact") },
    ];

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
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href={route("landing.home")}
                                    className="flex items-center"
                                >
                                    <span
                                        className="text-2xl font-bold"
                                        style={{ color: "#FF5C00" }}
                                    >
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
                                                className="hover:text-orange-500 transition-colors duration-200"
                                                style={{
                                                    color: isActive
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
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
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
                                                className="block px-3 py-2 hover:bg-gray-900 rounded-md"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
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
                <motion.footer
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-black text-white mt-auto"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Brand */}
                            <div>
                                <h3
                                    className="text-2xl font-bold mb-4"
                                    style={{ color: "#FF5C00" }}
                                >
                                    ZANOV SHOES
                                </h3>
                                <p className="text-gray-400">
                                    Premium Quality Footwear
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="font-semibold mb-4">
                                    Contact Us
                                </h4>
                                <div className="space-y-2 text-gray-400">
                                    {footer?.address && <p>{footer.address}</p>}
                                    {footer?.phone && (
                                        <p>Phone: {footer.phone}</p>
                                    )}
                                    {footer?.email && (
                                        <p>Email: {footer.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h4 className="font-semibold mb-4">
                                    Follow Us
                                </h4>
                                <div className="flex space-x-4">
                                    {footer?.facebook && (
                                        <a
                                            href={footer.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-orange-500 transition-colors"
                                        >
                                            <Facebook className="h-6 w-6" />
                                        </a>
                                    )}
                                    {footer?.instagram && (
                                        <a
                                            href={footer.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-orange-500 transition-colors"
                                        >
                                            <Instagram className="h-6 w-6" />
                                        </a>
                                    )}
                                    {footer?.twitter && (
                                        <a
                                            href={footer.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-orange-500 transition-colors"
                                        >
                                            <Twitter className="h-6 w-6" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>
                                &copy; {new Date().getFullYear()} ZANOV SHOES.
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </>
    );
}
