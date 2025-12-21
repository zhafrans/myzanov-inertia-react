import CollectorLayout from "@/Layouts/CollectorLayout";
import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SalesFilters from "@/Pages/Sales/Partials/SalesFilters";
import SalesPagination from "@/Pages/Sales/Partials/SalesPagination";

export default function CollectorUncollected() {
    const {
        sales,
        collectors,
        currentUserId,
        currentUserRole,
        selectedCollectorId,
        showAllCollectors,
        filters: initialFilters,
    } = usePage().props;

    const [filters, setFilters] = useState({
        sort: initialFilters.sort || "desc",
        payment_type: initialFilters.payment_type || "all",
        startDate: initialFilters.startDate || "",
        endDate: initialFilters.endDate || "",
        collector_id: showAllCollectors
            ? "all"
            : selectedCollectorId?.toString() || "all",
    });

    const [search, setSearch] = useState(initialFilters.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(
        initialFilters.search || ""
    );

    // Debounce search
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

        // Jika collector_id adalah "all", kirim null atau hapus parameter
        if (params.collector_id === "all") {
            delete params.collector_id;
        }

        router.get(route("collector.uncollected"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [filters, debouncedSearch]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Show collector filter only if current user role is not collector
    const showCollectorFilter = currentUserRole !== "collector";

    return (
        <CollectorLayout title="Belum Tertagih Bulan Ini - Collector">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Belum Tertagih Bulan Ini
                    </h1>
                    <p className="text-muted-foreground">
                        Daftar tagihan yang belum tertagih pada bulan ini
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-end">
                    {showCollectorFilter && (
                        <div className="w-full md:w-auto">
                            <label className="text-sm font-medium mb-2 block">
                                Collector
                            </label>
                            <Select
                                value={filters.collector_id || "all"}
                                onValueChange={(value) =>
                                    setFilters({
                                        ...filters,
                                        collector_id:
                                            value === "all" ? "all" : value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Collector
                                    </SelectItem>
                                    {collectors.map((collector) => (
                                        <SelectItem
                                            key={collector.id}
                                            value={collector.id.toString()}
                                        >
                                            {collector.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-2 block">
                            Search
                        </label>
                        <Input
                            placeholder="Cari invoice, customer, sales..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <SalesFilters filters={filters} setFilters={setFilters} />
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Belum Tertagih</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Tanggal Transaksi</TableHead>
                                        <TableHead>Total Harga</TableHead>
                                        <TableHead>Sisa Tagihan</TableHead>
                                        {showAllCollectors && (
                                            <TableHead>Collector</TableHead>
                                        )}
                                        <TableHead>Terakhir Ditagih</TableHead>
                                        <TableHead>Jumlah Terakhir</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.data && sales.data.length > 0 ? (
                                        sales.data.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell>
                                                    {sale.invoice}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.customer_name}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.sales}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.product} -{" "}
                                                    {sale.color}
                                                    <br />
                                                    <span className="text-xs text-muted-foreground">
                                                        Size: {sale.size}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(sale.date)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(sale.price)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        sale.remaining
                                                    )}
                                                </TableCell>
                                                {showAllCollectors && (
                                                    <TableCell>
                                                        {sale.last_collector_name ||
                                                            "-"}
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    {formatDate(
                                                        sale.last_collected_at
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        sale.last_installment_amount
                                                    )}
                                                    {sale.last_collector_name && (
                                                        <>
                                                            <br />
                                                            <span className="text-xs text-muted-foreground">
                                                                by{" "}
                                                                {
                                                                    sale.last_collector_name
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    showAllCollectors ? 10 : 9
                                                }
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                Tidak ada data tagihan yang
                                                belum tertagih
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {sales.links && sales.links.length > 1 && (
                            <div className="mt-4">
                                <SalesPagination links={sales.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CollectorLayout>
    );
}
