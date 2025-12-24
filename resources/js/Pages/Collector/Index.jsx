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
import { Clock } from "lucide-react";

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
        all_time: initialFilters.all_time || false,
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

        // Jika all_time true, hapus startDate dan endDate
        if (params.all_time) {
            delete params.startDate;
            delete params.endDate;
        } else {
            // Jika all_time false, hapus all_time dari params
            delete params.all_time;
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

    const calculateDaysUntilDue = (tempoAt) => {
        if (!tempoAt) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(tempoAt);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    const getTempoDisplay = (tempoAt) => {
        if (!tempoAt) return { date: "-", daysText: null, isOverdue: false };
        
        const daysUntil = calculateDaysUntilDue(tempoAt);
        const isOverdue = daysUntil < 0;
        
        let daysText = null;
        if (daysUntil > 0) {
            daysText = `${daysUntil} hari lagi`;
        } else if (daysUntil < 0) {
            daysText = `${Math.abs(daysUntil)} hari yang lalu`;
        } else {
            daysText = "Hari ini";
        }
        
        return {
            date: formatDate(tempoAt),
            daysText,
            isOverdue,
        };
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
    // Kecuali user bernama Lukman, dia bisa lihat filter
    const { auth } = usePage().props;
    const showCollectorFilter =
        currentUserRole?.toLowerCase() !== "collector" ||
        auth?.user?.name === "Lukman";

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

                {/* Charts - hanya tampilkan jika tidak menampilkan semua collector */}
                {!showAllCollectors && chartData && (
                    <div className="space-y-6">
                        {/* Average Count Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rata-rata Jumlah Tagihan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Rata-rata per hari
                                            </p>
                                            <p className="text-3xl font-bold mt-2">
                                                {chartData?.averageCount?.average?.toFixed(
                                                    2
                                                ) || "0"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                dari{" "}
                                                {Math.floor(
                                                    chartData?.averageCount
                                                        ?.days_with_installments ||
                                                        0
                                                )}{" "}
                                                hari yang memiliki tagihan
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                Total tagihan
                                            </p>
                                            <p className="text-2xl font-semibold mt-2">
                                                {chartData?.averageCount
                                                    ?.total || 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                dalam{" "}
                                                {Math.floor(
                                                    chartData?.averageCount
                                                        ?.days || 0
                                                )}{" "}
                                                hari
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Total Nominal
                                            </p>
                                            <p className="text-xl font-bold">
                                                {formatCurrency(
                                                    chartData?.averageCount
                                                        ?.total_amount || 0
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tagihan Per Periode</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {chartData?.monthlyData?.values?.length >
                                    0 ? (
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

                {/* Table - Desktop */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Tagihan</CardTitle>
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
                                        <TableHead>Tanggal Tagihan</TableHead>
                                        <TableHead>Jumlah Tagihan</TableHead>
                                        <TableHead>Nama Penagih</TableHead>
                                        <TableHead>Tanggal Jatuh Tempo</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.data && sales.data.length > 0 ? (
                                        sales.data.map((installment) => (
                                            <TableRow
                                                key={installment.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            "sales.show",
                                                            installment.sale_id
                                                        )
                                                    )
                                                }
                                            >
                                                <TableCell>
                                                    {installment.card_number ||
                                                        installment.invoice}
                                                </TableCell>
                                                <TableCell>
                                                    {installment.customer_name}
                                                </TableCell>
                                                <TableCell>
                                                    {installment.sales}
                                                </TableCell>
                                                <TableCell>
                                                    {installment.product} -{" "}
                                                    {installment.color}
                                                    <br />
                                                    <span className="text-xs text-muted-foreground">
                                                        Size: {installment.size}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        installment.date
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        installment.price
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        installment.remaining
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        installment.payment_date
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        installment.installment_amount
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {installment.collector_name ? (
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
                                                                                    installment.collector_name
                                                                            )
                                                                            ?.id.toString() ||
                                                                        "all",
                                                                });
                                                            }}
                                                        >
                                                            {
                                                                installment.collector_name
                                                            }
                                                        </Button>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const tempo = getTempoDisplay(installment.tempo_at);
                                                        if (!installment.tempo_at) {
                                                            return <span className="text-muted-foreground">-</span>;
                                                        }
                                                        return (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5">
                                                                    {tempo.isOverdue && (
                                                                        <Clock className="w-4 h-4 text-red-600" />
                                                                    )}
                                                                    <span
                                                                        className={`font-medium ${
                                                                            tempo.isOverdue
                                                                                ? "text-red-600"
                                                                                : "text-foreground"
                                                                        }`}
                                                                    >
                                                                        {tempo.date}
                                                                    </span>
                                                                </div>
                                                                {tempo.daysText && (
                                                                    <span
                                                                        className={`text-xs ${
                                                                            tempo.isOverdue
                                                                                ? "text-red-600"
                                                                                : "text-muted-foreground"
                                                                        }`}
                                                                    >
                                                                        {tempo.daysText}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${
                                                            installment.status ===
                                                            "paid"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {installment.status ===
                                                        "paid"
                                                            ? "Lunas"
                                                            : "Belum Lunas"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={12}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                Tidak ada data tagihan
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-0 overflow-hidden -mx-6">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((installment) => (
                                    <div
                                        key={installment.id}
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    "sales.show",
                                                    installment.sale_id
                                                )
                                            )
                                        }
                                        className="w-full px-6 bg-card hover:bg-muted/50 active:bg-muted transition-colors py-3 cursor-pointer rounded-none border-b-2 border-gray-800"
                                    >
                                        {/* Card No */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Card No
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {installment.card_number ||
                                                    installment.invoice ||
                                                    "-"}
                                            </p>
                                        </div>

                                        {/* Customer */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Customer
                                            </p>
                                            <p className="text-sm font-medium">
                                                {installment.customer_name ||
                                                    "-"}
                                            </p>
                                        </div>

                                        {/* Sales & Product */}
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Sales
                                                </p>
                                                <p className="text-xs font-medium">
                                                    {installment.sales || "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Produk
                                                </p>
                                                <p className="text-xs font-medium">
                                                    {installment.product || "-"}
                                                    {installment.color &&
                                                        ` - ${installment.color}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tanggal Transaksi */}
                                        <div className="mb-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Tanggal Transaksi
                                            </p>
                                            <p className="text-xs font-medium">
                                                {formatDate(installment.date)}
                                            </p>
                                        </div>

                                        {/* Jumlah Tagihan & Sisa Tagihan */}
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Jumlah Tagihan
                                                </p>
                                                <p className="text-xs font-semibold">
                                                    {formatCurrency(
                                                        installment.installment_amount
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Sisa Tagihan
                                                </p>
                                                <p
                                                    className={`text-xs font-bold ${
                                                        installment.remaining >
                                                        0
                                                            ? "text-red-600"
                                                            : "text-green-600"
                                                    }`}
                                                >
                                                    {formatCurrency(
                                                        installment.remaining
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Nama Penagih & Status */}
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Penagih
                                                </p>
                                                <p className="text-xs font-medium">
                                                    {installment.collector_name ||
                                                        "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Status
                                                </p>
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-xs ${
                                                        installment.status ===
                                                        "paid"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {installment.status ===
                                                    "paid"
                                                        ? "Lunas"
                                                        : "Belum Lunas"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tanggal Jatuh Tempo */}
                                        {installment.tempo_at && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    Tanggal Jatuh Tempo
                                                </p>
                                                <div className="text-xs">
                                                    {(() => {
                                                        const tempo = getTempoDisplay(installment.tempo_at);
                                                        return (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5">
                                                                    {tempo.isOverdue && (
                                                                        <Clock className="w-3 h-3 text-red-600" />
                                                                    )}
                                                                    <span
                                                                        className={`font-medium ${
                                                                            tempo.isOverdue
                                                                                ? "text-red-600"
                                                                                : "text-foreground"
                                                                        }`}
                                                                    >
                                                                        {tempo.date}
                                                                    </span>
                                                                </div>
                                                                {tempo.daysText && (
                                                                    <span
                                                                        className={`${
                                                                            tempo.isOverdue
                                                                                ? "text-red-600"
                                                                                : "text-muted-foreground"
                                                                        }`}
                                                                    >
                                                                        {tempo.daysText}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground px-6">
                                    Tidak ada data tagihan
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
