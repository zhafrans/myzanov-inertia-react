import LandingPageLayout from "@/Layouts/LandingPageLayout"
import { motion } from "framer-motion"

export default function About({ about, footer }) {
    return (
        <LandingPageLayout title="Tentang - ZANOV SHOES" footer={footer}>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-lg shadow-lg p-8 md:p-12"
                    >
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl font-bold mb-6 text-center"
                            style={{ color: "#FF5C00" }}
                        >
                            {about?.title || "Tentang ZANOV"}
                        </motion.h1>

                        <div className="prose prose-lg max-w-none">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-gray-700 mb-6 leading-relaxed"
                            >
                                {about?.description || "ZANOV Shoes adalah brand sepatu premium yang menghadirkan kualitas terbaik dengan desain yang elegan dan modern. Kami berkomitmen untuk memberikan produk berkualitas tinggi dengan harga yang terjangkau."}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="my-8 p-6 rounded-lg"
                                style={{ backgroundColor: "#FFF5E6" }}
                            >
                                <h2 className="text-2xl font-semibold mb-4" style={{ color: "#FF5C00" }}>
                                    Misi Kami
                                </h2>
                                <p className="text-gray-700">
                                    {about?.mission || "Misi kami adalah menghadirkan sepatu berkualitas premium dengan desain yang timeless dan nyaman digunakan sehari-hari."}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="my-8 p-6 rounded-lg"
                                style={{ backgroundColor: "#FFF5E6" }}
                            >
                                <h2 className="text-2xl font-semibold mb-4" style={{ color: "#FF5C00" }}>
                                    Visi Kami
                                </h2>
                                <p className="text-gray-700">
                                    {about?.vision || "Menjadi brand sepatu terdepan di Indonesia yang dikenal dengan kualitas, inovasi, dan pelayanan terbaik."}
                                </p>
                            </motion.div>

                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: "👟", title: "Kualitas Utama", desc: "Kami hanya menggunakan bahan berkualitas tinggi untuk setiap produk" },
                                    { icon: "🎯", title: "Fokus Pelanggan", desc: "Kepuasan pelanggan adalah prioritas utama kami" },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.2 }}
                                        whileHover={{ y: -10, scale: 1.05 }}
                                        className="text-center p-6 rounded-lg border-2"
                                        style={{ borderColor: "#FF5C00" }}
                                    >
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className="text-4xl mb-4"
                                        >
                                            {item.icon}
                                        </motion.div>
                                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                        <p className="text-gray-600">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </LandingPageLayout>
    )
}