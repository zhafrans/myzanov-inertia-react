import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState, useRef } from "react"
import SalesTableRow from "./SalesTableRow"
import SalesFilters from "./SalesFilters"
import SalesPagination from "./SalesPagination"
import { router, usePage } from "@inertiajs/react"

export default function SalesTable() {
    const { sales, filters: initialFilters, availableSizes } = usePage().props;
    
    const [filters, setFilters] = useState({
        size: initialFilters.size || "all",
        sort: initialFilters.sort || "desc",
        status: initialFilters.status || "all",
        notCollectedThisMonth: initialFilters.notCollectedThisMonth || false,
    })

    const [search, setSearch] = useState(initialFilters.search || "")
    const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || "")
    
    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    const isFirstRender = useRef(true)

    // Apply filters
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const params = {
            ...filters,
            search: debouncedSearch,
        }
        
        router.get(route('sales.index'), params, {
            preserveState: true,
            replace: true,
        })
    }, [filters, debouncedSearch])

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }

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
                    setFilters={handleFilterChange}
                    availableSizes={availableSizes}
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
                        {sales.data.map(item => (
                            <SalesTableRow key={item.id} item={item} />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <SalesPagination
                links={sales.links}
            />
        </div>
    )
}