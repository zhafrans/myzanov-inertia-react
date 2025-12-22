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
        province_id: initialFilters.province_id || "",
        city_id: initialFilters.city_id || "",
        subdistrict_id: initialFilters.subdistrict_id || "",
        village_id: initialFilters.village_id || "",
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
    // Kecuali user bernama Lukman, dia bisa lihat filter
    const { auth } = usePage().props;
    const showCollectorFilter =
        currentUserRole?.toLowerCase() !== "collector" ||
        auth?.user?.name === "Lukman";

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
                <div className="flex flex-wrap gap-4 items-end -mx-6 md:mx-0 px-6 md:px-0">
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

                {/* Table - Desktop */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Belum Tertagih</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Card No</TableHead>
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
                                            <TableRow
                                                key={sale.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            "sales.show",
                                                            sale.id
                                                        )
                                                    )
                                                }
                                            >
                                                <TableCell>
                                                    {sale.card_number ||
                                                        sale.invoice}
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-0 overflow-hidden -mx-6">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((sale) => (
                                    <div
                                        key={sale.id}
                                        onClick={() =>
                                            router.visit(
                                                route("sales.show", sale.id)
                                            )
                                        }
                                        className="w-full px-6 border-x-0 border-y rounded-none first:border-t last:border-b bg-card hover:bg-muted/50 active:bg-muted transition-colors py-3 cursor-pointer"
                                    >
                                        {/* Card No */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Card No
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {sale.card_number ||
                                                    sale.invoice ||
                                                    "-"}
                                            </p>
                                        </div>

                                        {/* Customer */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Customer
                                            </p>
                                            <p className="text-sm font-medium">
                                                {sale.customer_name || "-"}
                                            </p>
                                        </div>

                                        {/* Sales & Product */}
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Sales
                                                </p>
                                                <p className="text-xs font-medium">
                                                    {sale.sales || "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Produk
                                                </p>
                                                <p className="text-xs font-medium">
                                                    {sale.product || "-"}
                                                    {sale.color &&
                                                        ` - ${sale.color}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tanggal Transaksi */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Tanggal Transaksi
                                            </p>
                                            <p className="text-xs font-medium">
                                                {formatDate(sale.date)}
                                            </p>
                                        </div>

                                        {/* Sisa Tagihan */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Sisa Tagihan
                                            </p>
                                            <p
                                                className={`text-sm font-bold ${
                                                    sale.remaining > 0
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {formatCurrency(sale.remaining)}
                                            </p>
                                        </div>

                                        {/* Terakhir Ditagih & Jumlah Terakhir */}
                                        {sale.last_collected_at && (
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">
                                                        Terakhir Ditagih
                                                    </p>
                                                    <p className="text-xs font-medium">
                                                        {formatDate(
                                                            sale.last_collected_at
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">
                                                        Jumlah Terakhir
                                                    </p>
                                                    <p className="text-xs font-semibold">
                                                        {formatCurrency(
                                                            sale.last_installment_amount
                                                        )}
                                                    </p>
                                                    {sale.last_collector_name && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            by{" "}
                                                            {
                                                                sale.last_collector_name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Collector (jika showAllCollectors) */}
                                        {showAllCollectors &&
                                            sale.last_collector_name && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground mb-0.5">
                                                        Collector
                                                    </p>
                                                    <p className="text-xs font-medium">
                                                        {
                                                            sale.last_collector_name
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground px-6">
                                    Tidak ada data tagihan yang belum tertagih
                                </div>
                            )}
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
