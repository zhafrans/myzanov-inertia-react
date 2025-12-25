import LandingPageLayout from "@/Layouts/LandingPageLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { router } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Catalogue({ products, filters, footer }) {
    const [search, setSearch] = useState(filters?.search || "")
    const [gender, setGender] = useState(filters?.gender || "")
    const [material, setMaterial] = useState(filters?.material || "")
    const [sortBy, setSortBy] = useState(filters?.sort_by || "created_at")
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "desc")

    useEffect(() => {
        const params = {}
        if (search) params.search = search
        if (gender) params.gender = gender
        if (material) params.material = material
        if (sortBy !== "created_at") params.sort_by = sortBy
        if (sortOrder !== "desc") params.sort_order = sortOrder

        router.get(route("landing.catalogue"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }, [search, gender, material, sortBy, sortOrder])

    return (
        <LandingPageLayout title="Katalog - ZANOV SHOES" footer={footer}>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold mb-8 text-center"
                        style={{ color: "#FF5C00" }}
                    >
                        Produk Kami
                    </motion.h1>

                    {/* Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-6 rounded-lg shadow-md mb-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Input
                                placeholder="Cari berdasarkan nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="md:col-span-2"
                            />

                            <Select value={gender || "semua"} onValueChange={(value) => setGender(value === "semua" ? "" : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Gender</SelectItem>
                                    <SelectItem value="Pria">Pria</SelectItem>
                                    <SelectItem value="Wanita">Wanita</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Material..."
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                            />

                            <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
                                const [by, order] = value.split("_")
                                setSortBy(by)
                                setSortOrder(order)
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Urutkan berdasarkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at_desc">Terbaru</SelectItem>
                                    <SelectItem value="cash_price_asc">Harga Cash: Rendah ke Tinggi</SelectItem>
                                    <SelectItem value="cash_price_desc">Harga Cash: Tinggi ke Rendah</SelectItem>
                                    <SelectItem value="credit_price_asc">Harga Kredit: Rendah ke Tinggi</SelectItem>
                                    <SelectItem value="credit_price_desc">Harga Kredit: Tinggi ke Rendah</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </motion.div>

                    {/* Grid Produk */}
                    {products && products.data && products.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.data.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    {product.image_url || product.image ? (
                                        <img
                                            src={product.image_url || product.image}
                                            alt={product.name}
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">Tidak Ada Gambar</span>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                                            {product.category && (
                                                <p>Kategori: {product.category}</p>
                                            )}
                                            {product.gender && (
                                                <p>Gender: {product.gender}</p>
                                            )}
                                            {product.material && (
                                                <p>Material: {product.material}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {product.cash_price && (
                                                <p className="font-semibold">
                                                    Cash: Rp {Number(product.cash_price).toLocaleString("id-ID")}
                                                </p>
                                            )}
                                            {product.credit_price && (
                                                <p className="font-semibold" style={{ color: "#FF5C00" }}>
                                                    Kredit: Rp {Number(product.credit_price).toLocaleString("id-ID")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Tidak ada produk yang ditemukan</p>
                        </div>
                    )}

                    {/* Paginasi */}
                    {products && products.links && products.links.length > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {products.links.map((link, index) => {
                                const isPrevious = link.label.includes('Sebelumnya') || link.label.includes('pagination.previous') || link.label.includes('&laquo;')
                                const isNext = link.label.includes('Berikutnya') || link.label.includes('pagination.next') || link.label.includes('&raquo;')
                                
                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size={isPrevious || isNext ? "icon" : "default"}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url || link.active}
                                        style={link.active ? { backgroundColor: "#FF5C00" } : {}}
                                    >
                                        {isPrevious ? (
                                            <ChevronLeft className="w-4 h-4" />
                                        ) : isNext ? (
                                            <ChevronRight className="w-4 h-4" />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </LandingPageLayout>
    )
}