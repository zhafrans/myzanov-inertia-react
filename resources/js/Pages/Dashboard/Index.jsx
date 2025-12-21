import AppLayout from "@/Layouts/AppLayout";
import SummaryCards from "./Partials/SummaryCards";
import MonthlySalesChart from "./Partials/MonthlySalesChart";
import SalesPieChart from "./Partials/SalesPieChart";
import PaymentTypePieChart from "./Partials/PaymentTypePieChart";
import StatusPieChart from "./Partials/StatusPieChart";
import TopProduct from "./Partials/TopProduct";
import TopSize from "./Partials/TopSize";
import TopColor from "./Partials/TopColor";
import TopCity from "./Partials/TopCity";
import TopSubdistrict from "./Partials/TopSubdistrict";
import DashboardFilter from "./Partials/DashboardFilter";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    // Default: bulan ini (tanggal awal bulan - tanggal akhir bulan)
    const getDefaultDateRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            start_date: startOfMonth.toISOString().split("T")[0],
            end_date: endOfMonth.toISOString().split("T")[0],
        };
    };

    const [filters, setFilters] = useState(getDefaultDateRange());

    // State untuk limit setiap top card (default 5)
    const [limits, setLimits] = useState({
        topProduct: 5,
        topSize: 5,
        topColor: 5,
        topCity: 5,
        topSubdistrict: 5,
    });

    // State untuk loading per card
    const [cardLoading, setCardLoading] = useState({
        topProduct: false,
        topSize: false,
        topColor: false,
        topCity: false,
        topSubdistrict: false,
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.all_time) {
                params.append("all_time", "1");
            } else {
                if (filters.start_date)
                    params.append("start_date", filters.start_date);
                if (filters.end_date)
                    params.append("end_date", filters.end_date);
            }

            // Tambahkan limit untuk setiap top card (selalu default 5 untuk initial fetch)
            params.append("top_product_limit", 5);
            params.append("top_size_limit", 5);
            params.append("top_color_limit", 5);
            params.append("top_city_limit", 5);
            params.append("top_subdistrict_limit", 5);

            const response = await axios.get(
                `/api/dashboard/data?${params.toString()}`
            );
            setStats(response.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Gagal memuat data dashboard. Silakan coba lagi.");

            // Fallback data untuk development
            setStats({
                summary: {
                    totalTanggungan: "Rp 12.500.000",
                    totalTerjual: 320,
                    belumLunas: 45,
                    sudahLunas: 275,
                },
                monthlySales: {
                    months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
                    series: [
                        { name: "Umi", data: [10, 15, 20, 18, 22, 25] },
                        { name: "Bihan", data: [8, 12, 15, 14, 18, 20] },
                        { name: "Dilham", data: [12, 18, 22, 20, 25, 30] },
                        { name: "Ati", data: [6, 10, 13, 12, 15, 20] },
                    ],
                },
                salesByUser: {
                    labels: ["Umi", "Bihan", "Dilham", "Ati"],
                    values: [120, 80, 65, 55],
                },
                salesByPaymentType: {
                    labels: ["cash", "credit", "cash_tempo"],
                    values: [150, 100, 70],
                },
                salesByStatus: {
                    labels: ["paid", "unpaid"],
                    values: [200, 120],
                },
                topProduct: [
                    { name: "Sepatu A", total: 120 },
                    { name: "Sepatu B", total: 90 },
                    { name: "Sepatu C", total: 60 },
                ],
                topSize: [
                    { name: "40", total: 110 },
                    { name: "41", total: 95 },
                    { name: "42", total: 70 },
                ],
                topColor: [
                    { name: "Hitam", total: 150 },
                    { name: "Putih", total: 90 },
                    { name: "Coklat", total: 80 },
                ],
                topCity: [
                    { name: "Semarang", total: 140 },
                    { name: "Surabaya", total: 110 },
                    { name: "Jakarta", total: 70 },
                ],
                topSubdistrict: [
                    { name: "Tembalang", total: 60 },
                    { name: "Banyumanik", total: 50 },
                    { name: "Pedurungan", total: 40 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        // Reset limit ke default 5 saat filter berubah (sebelum set filters)
        setLimits({
            topProduct: 5,
            topSize: 5,
            topColor: 5,
            topCity: 5,
            topSubdistrict: 5,
        });
        // Reset loading state
        setCardLoading({
            topProduct: false,
            topSize: false,
            topColor: false,
            topCity: false,
            topSubdistrict: false,
        });
        // Set filters setelah reset limit (ini akan trigger useEffect)
        setFilters(newFilters);
    };

    // Handler untuk menambah limit +5 dan fetch data individual
    const handleLoadMore = async (cardType) => {
        const newLimit = limits[cardType] + 5;

        // Set loading untuk card ini saja
        setCardLoading((prev) => ({
            ...prev,
            [cardType]: true,
        }));

        try {
            const params = new URLSearchParams();
            if (filters.all_time) {
                params.append("all_time", "1");
            } else {
                if (filters.start_date)
                    params.append("start_date", filters.start_date);
                if (filters.end_date)
                    params.append("end_date", filters.end_date);
            }
            params.append("limit", newLimit);

            // Map cardType ke endpoint cardType
            const cardTypeMap = {
                topProduct: "top-product",
                topSize: "top-size",
                topColor: "top-color",
                topCity: "top-city",
                topSubdistrict: "top-subdistrict",
            };

            const response = await axios.get(
                `/api/dashboard/top-card/${
                    cardTypeMap[cardType]
                }?${params.toString()}`
            );

            // Update hanya data card yang bersangkutan
            setStats((prev) => ({
                ...prev,
                [cardType]: response.data,
            }));

            // Update limit
            setLimits((prev) => ({
                ...prev,
                [cardType]: newLimit,
            }));
        } catch (err) {
            console.error(`Error fetching ${cardType} data:`, err);
            toast.error(`Gagal memuat data ${cardType}. Silakan coba lagi.`);
        } finally {
            setCardLoading((prev) => ({
                ...prev,
                [cardType]: false,
            }));
        }
    };

    if (loading && !stats) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {stats && (
                <>
                    <SummaryCards stats={stats.summary} />
                    <DashboardFilter onFilterChange={handleFilterChange} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <MonthlySalesChart
                                data={stats.monthlySales}
                                loading={loading}
                            />
                        </div>
                        <SalesPieChart
                            data={stats.salesByUser}
                            loading={loading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PaymentTypePieChart
                            data={stats.salesByPaymentType}
                            loading={loading}
                        />
                        <StatusPieChart
                            data={stats.salesByStatus}
                            loading={loading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <TopProduct
                            data={stats.topProduct}
                            loading={cardLoading.topProduct}
                            onLoadMore={() => handleLoadMore("topProduct")}
                            currentLimit={limits.topProduct}
                        />
                        <TopSize
                            data={stats.topSize}
                            loading={cardLoading.topSize}
                            onLoadMore={() => handleLoadMore("topSize")}
                            currentLimit={limits.topSize}
                        />
                        <TopColor
                            data={stats.topColor}
                            loading={cardLoading.topColor}
                            onLoadMore={() => handleLoadMore("topColor")}
                            currentLimit={limits.topColor}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <TopCity
                            data={stats.topCity}
                            loading={cardLoading.topCity}
                            onLoadMore={() => handleLoadMore("topCity")}
                            currentLimit={limits.topCity}
                        />
                        <TopSubdistrict
                            data={stats.topSubdistrict}
                            loading={cardLoading.topSubdistrict}
                            onLoadMore={() => handleLoadMore("topSubdistrict")}
                            currentLimit={limits.topSubdistrict}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout title="Dashboard">{page}</AppLayout>;
