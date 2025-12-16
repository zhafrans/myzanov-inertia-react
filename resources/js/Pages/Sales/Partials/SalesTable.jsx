import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react"
import SalesTableRow from "./SalesTableRow"
import SalesFilters from "./SalesFilters"
import SalesPagination from "./SalesPagination"

const dummyData = [
    {
        id: 1,
        size: "40",
        cardNo: "CRD-001",
        sales: "Umi",
        product: "Sepatu A",
        color: "Hitam",
        address: "Tembalang, Semarang",
        date: "2025-01-10",
        price: 350000,
        remaining: 150000,
    },
    {
        id: 2,
        size: "41",
        cardNo: "CRD-002",
        sales: "Bihan",
        product: "Sepatu B",
        color: "Putih",
        address: "Banyumanik, Semarang",
        date: "2025-01-05",
        price: 400000,
        remaining: 0,
    },
]

const PER_PAGE = 1

export default function SalesTable() {
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

                <SalesFilters
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>

            {/* TABLE */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Card No</TableHead>
                            <TableHead>Sales</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Warna</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Tgl Ambil</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Sisa</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedData.map(item => (
                            <SalesTableRow key={item.id} item={item} />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <SalesPagination
                page={page}
                setPage={setPage}
                total={total}
                perPage={PER_PAGE}
            />
        </div>
    )
}
