import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact({ contact, footer }) {
    const contactItems = [
        {
            icon: MapPin,
            label: "Address",
            value:
                contact?.address ||
                "Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345",
        },
        {
            icon: Phone,
            label: "Phone",
            value: contact?.phone || "+62 123 456 7890",
        },
        {
            icon: Mail,
            label: "Email",
            value: contact?.email || "info@zanovshoes.com",
        },
    ];

    return (
        <LandingPageLayout title="Contact - ZANOV SHOES" footer={footer}>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold mb-8 text-center"
                        style={{ color: "#FF5C00" }}
                    >
                        Contact Us
                    </motion.h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white rounded-lg shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-semibold mb-6">
                                Get in Touch
                            </h2>

                            <div className="space-y-6">
                                {contactItems.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.3 + index * 0.1,
                                            }}
                                            whileHover={{ x: 10 }}
                                            className="flex items-start"
                                        >
                                            <motion.div
                                                whileHover={{
                                                    rotate: 360,
                                                    scale: 1.1,
                                                }}
                                                transition={{ duration: 0.5 }}
                                                className="p-3 rounded-full mr-4"
                                                style={{
                                                    backgroundColor: "#FF5C00",
                                                }}
                                            >
                                                <Icon className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="font-semibold mb-1">
                                                    {item.label}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Google Maps */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-white rounded-lg shadow-lg overflow-hidden"
                        >
                            <iframe
                                src={
                                    contact?.map_url ||
                                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3694!2d106.8167!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNiJTIDEwNsKwNDknMDAuMSJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
                                }
                                width="100%"
                                height="100%"
                                style={{ minHeight: "400px", border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </motion.div>
                    </div>
                </div>
            </div>
        </LandingPageLayout>
    );
}
