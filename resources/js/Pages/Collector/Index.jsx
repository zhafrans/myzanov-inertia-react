import CollectorLayout from "@/Layouts/CollectorLayout";
import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import Chart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SalesFilters from "@/Pages/Sales/Partials/SalesFilters";
import SalesPagination from "@/Pages/Sales/Partials/SalesPagination";

export default function CollectorIndex() {
    const {
        sales,
        collectors,
        currentUserId,
        currentUserRole,
        selectedCollectorId,
        showAllCollectors,
        chartData,
        filters: initialFilters,
    } = usePage().props;

    const [filters, setFilters] = useState({
        sort: initialFilters.sort || "desc",
        status: initialFilters.status || "all",
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

        router.get(route("collector.index"), params, {
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

    // Chart options untuk monthly data
    const monthlyChartOptions = {
        chart: {
            toolbar: { show: false },
            type: "line",
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        xaxis: {
            categories: chartData?.monthlyData?.months || [],
        },
        yaxis: {
            title: {
                text: "Jumlah Tagihan (Rp)",
            },
            labels: {
                formatter: (value) => {
                    return new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(value);
                },
            },
        },
        tooltip: {
            y: {
                formatter: (value) => formatCurrency(value),
            },
        },
    };

    const monthlyChartSeries = [
        {
            name: "Total Tagihan",
            data: chartData?.monthlyData?.values || [],
        },
    ];

    // Chart options untuk payment type
    const paymentTypeChartOptions = {
        chart: {
            toolbar: { show: false },
        },
        labels:
            chartData?.byPaymentType?.labels?.map((label) => {
                const labelMap = {
                    cash: "Cash",
                    credit: "Credit",
                    cash_tempo: "Cash Tempo",
                };
                return labelMap[label] || label;
            }) || [],
        legend: {
            position: "bottom",
        },
        tooltip: {
            y: {
                formatter: (value) => formatCurrency(value),
            },
        },
    };

    const paymentTypeChartSeries = chartData?.byPaymentType?.values || [];

    // Show collector filter only if current user role is not collector
    const showCollectorFilter = currentUserRole !== "collector";

    return (
        <CollectorLayout title="Riwayat Tagihan - Collector">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Riwayat Tagihan</h1>
                    <p className="text-muted-foreground">
                        Lihat riwayat tagihan yang telah Anda kumpulkan
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

                {/* Charts - hanya tampilkan jika tidak menampilkan semua collector */}
                {!showAllCollectors && chartData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tagihan Per Periode</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData?.monthlyData?.values?.length > 0 ? (
                                    <Chart
                                        type="line"
                                        height={300}
                                        series={monthlyChartSeries}
                                        options={monthlyChartOptions}
                                    />
                                ) : (
                                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                                        Tidak ada data tagihan
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Tagihan per Tipe Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {paymentTypeChartSeries.length > 0 ? (
                                    <Chart
                                        type="pie"
                                        height={300}
                                        series={paymentTypeChartSeries}
                                        options={paymentTypeChartOptions}
                                    />
                                ) : (
                                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                                        Tidak ada data pembayaran
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {showAllCollectors && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Grafik tagihan hanya tersedia saat memilih
                                collector tertentu. Silakan pilih collector
                                untuk melihat grafik.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Tagihan</CardTitle>
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
                                        <TableHead>Nama Penagih</TableHead>
                                        <TableHead>Terakhir Ditagih</TableHead>
                                        <TableHead>Jumlah Terakhir</TableHead>
                                        <TableHead>Status</TableHead>
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
                                                <TableCell>
                                                    {sale.last_collector_name ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFilters({
                                                                    ...filters,
                                                                    collector_id:
                                                                        collectors
                                                                            .find(
                                                                                (
                                                                                    c
                                                                                ) =>
                                                                                    c.name ===
                                                                                    sale.last_collector_name
                                                                            )
                                                                            ?.id.toString() ||
                                                                        "all",
                                                                });
                                                            }}
                                                        >
                                                            {
                                                                sale.last_collector_name
                                                            }
                                                        </Button>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        sale.last_collected_at
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        sale.last_installment_amount
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${
                                                            sale.status ===
                                                            "paid"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {sale.status === "paid"
                                                            ? "Lunas"
                                                            : "Belum Lunas"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={11}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                Tidak ada data tagihan
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
