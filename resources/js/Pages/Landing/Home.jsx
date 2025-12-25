import LandingPageLayout from "@/Layouts/LandingPageLayout"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Home({ hero, about, footer }) {
    return (
        <LandingPageLayout title="Beranda - ZANOV SHOES" footer={footer}>
            {/* Bagian Hero */}
            <section
                className="relative h-screen flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: `url(${hero?.background_image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80"})`,
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* Konten */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 text-center px-4"
                >
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-6xl md:text-8xl font-bold mb-6 text-white"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                    >
                        {hero?.title || "ZANOV SHOES"}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-xl md:text-2xl text-white mb-8"
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                    >
                        {hero?.subtitle || "Sepatu Berkualitas Premium"}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link href={route("landing.catalogue")}>
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6"
                                style={{
                                    backgroundColor: "#FF5C00",
                                    color: "white",
                                }}
                            >
                                Jelajahi Koleksi
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Bagian Tentang */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-20 bg-white"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4" style={{ color: "#FF5C00" }}>
                            {about?.title || "Tentang ZANOV"}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            {about?.description || "ZANOV Shoes adalah brand sepatu premium yang menghadirkan kualitas terbaik dengan desain yang elegan dan modern."}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {[
                            { icon: "👟", title: "Kualitas Premium", desc: "Menggunakan bahan berkualitas tinggi untuk kenyamanan maksimal" },
                            { icon: "🎨", title: "Desain Modern", desc: "Desain yang elegan dan timeless untuk gaya yang selalu up-to-date" },
                            { icon: "💎", title: "Harga Terjangkau", desc: "Kualitas premium dengan harga yang terjangkau untuk semua kalangan" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                whileHover={{ y: -10, scale: 1.05 }}
                                className="text-center"
                            >
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "#FF5C00" }}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </LandingPageLayout>
    )
}