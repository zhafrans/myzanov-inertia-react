import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react"
import CatalogueFilters from "./CatalogueFilters"
import CataloguePagination from "./CataloguePagination"
import CatalogueTableRow from "./CatalogueTableRow"

const dummyData = [
    {
        id: 1,
        name: "Sepatu A",
        category: "Sepatu",
        gender: "Pria",
        material: "Kulit",
        cashPrice: 350000,
        creditPrice: 400000,
        image: "https://via.placeholder.com/80",
    },
    {
        id: 2,
        name: "Sepatu B",
        category: "Sneakers",
        gender: "Wanita",
        material: "Canvas",
        cashPrice: 300000,
        creditPrice: 360000,
        image: "https://via.placeholder.com/80",
    },
]


const PER_PAGE = 1

export default function CatalogueTable() {
    const [filters, setFilters] = useState({
        size: "all",
        sort: "desc",
    })

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [page, setPage] = useState(1)

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    // FILTER + SEARCH + SORT
    const filteredData = useMemo(() => {
        let data = [...dummyData]

        if (debouncedSearch) {
            const keyword = debouncedSearch.toLowerCase()
            data = data.filter(item =>
                item.cardNo.toLowerCase().includes(keyword) ||
                item.sales.toLowerCase().includes(keyword) ||
                item.product.toLowerCase().includes(keyword)
            )
        }

        if (filters.size !== "all") {
            data = data.filter(item => item.size === filters.size)
        }

        data.sort((a, b) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return filters.sort === "asc"
                ? dateA - dateB
                : dateB - dateA
        })

        return data
    }, [filters, debouncedSearch])

    // PAGINATION
    const total = filteredData.length
    const paginatedData = useMemo(() => {
        const start = (page - 1) * PER_PAGE
        return filteredData.slice(start, start + PER_PAGE)
    }, [filteredData, page])

    return (
        <div className="space-y-4">
            {/* TOOLBAR */}
            <div className="flex flex-wrap gap-3 justify-between">
                <Input
                    placeholder="Cari card no / sales / produk..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                />

                <CatalogueFilters
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>

            {/* TABLE */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Bahan</TableHead>
                            <TableHead>Harga Cash</TableHead>
                            <TableHead>Harga Kredit</TableHead>
                            <TableHead>Gambar</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedData.map(item => (
                            <CatalogueTableRow key={item.id} item={item} />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <CataloguePagination
                page={page}
                setPage={setPage}
                total={total}
                perPage={PER_PAGE}
            />
        </div>
    )
}
