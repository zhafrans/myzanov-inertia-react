import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import SalesTableRow from "./SalesTableRow";
import SalesFilters from "./SalesFilters";
import SalesPagination from "./SalesPagination";
import { router, usePage } from "@inertiajs/react";

import CreateModal from "../CreateModal";

export default function SalesTable() {
    const {
        sales,
        filters: initialFilters,
        availableSizes,
        collectors,
    } = usePage().props;

    const [filters, setFilters] = useState({
        size: initialFilters.size || "all",
        sort: initialFilters.sort || "desc",
        status: initialFilters.status || "all",
        notCollectedThisMonth: initialFilters.notCollectedThisMonth || false,
        startDate: initialFilters.startDate || "",
        endDate: initialFilters.endDate || "",
    });

    const [search, setSearch] = useState(initialFilters.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(
        initialFilters.search || ""
    );

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const isFirstRender = useRef(true);

    // Apply filters
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const params = {
            ...filters,
            search: debouncedSearch,
        };

        router.get(route("sales.index"), params, {
            preserveState: true,
            replace: true,
        });
    }, [filters, debouncedSearch]);

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            ...filters,
            search: debouncedSearch,
        });

        window.location.href = route("sales.export") + "?" + params.toString();
    };

    return (
        <div className="space-y-4">
            {/* TOOLBAR */}
            <div className="flex flex-wrap gap-3 justify-between">
                <Input
                    placeholder="Cari card no / sales / produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="text-green-600 hover:text-green-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <CreateModal />
                    <SalesFilters
                        filters={filters}
                        setFilters={handleFilterChange}
                        availableSizes={availableSizes}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Card No</TableHead>
                            <TableHead>Nama Customer</TableHead>
                            <TableHead>Sales</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Tgl Ambil</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Sisa</TableHead>
                            <TableHead>Terakhir Ditagih</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {sales.data.map((item) => (
                            <SalesTableRow
                                key={item.id}
                                item={item}
                                collectors={collectors}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <SalesPagination links={sales.links} />
        </div>
    );
}
