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
import logo from "@/Public/Images/myzanovweb.png"; // Import logo

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

    const [filters, setFilters] = useState({
        ...getDefaultDateRange(),
        payment_status: null, // null = all, 'paid' = paid, 'unpaid' = unpaid
    });

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

    const [showWelcome, setShowWelcome] = useState(false);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        setShowWelcome(false);

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
            
            // Add payment status filter if specified
            if (filters.payment_status) {
                params.append("payment_status", filters.payment_status);
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
            // setError("Gagal memuat data dashboard. Silakan coba lagi.");
            setShowWelcome(true); // Tampilkan halaman selamat datang
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
        if (!stats) return; // Jangan jalankan jika tidak ada data

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
            
            // Add payment status filter if specified
            if (filters.payment_status) {
                params.append("payment_status", filters.payment_status);
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

    // Tampilkan halaman selamat datang jika gagal memuat data
    if (showWelcome) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center space-y-8 max-w-2xl">
                    <div className="flex justify-center">
                        <img
                            src={logo}
                            alt="MyZANOV Web App"
                            className="h-24 w-auto md:h-32 lg:h-40 animate-fade-in"
                        />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight">
                            SELAMAT DATANG
                        </h1>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-600">
                            di MyZANOV Web App
                        </h2>
                    </div>

                    <div className="space-y-6 pt-4">
                        {/* <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                            Aplikasi monitoring penjualan yang membantu Anda
                            mengelola dan menganalisis data penjualan dengan
                            mudah dan efisien.
                        </p> */}

                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Loading state (hanya tampilkan saat pertama kali loading)
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

    // Tampilkan dashboard jika data tersedia
    return (
        <div className="space-y-6">
            {error && !showWelcome && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {stats && (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Monitor penjualan dan analisis data
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <img
                                src={logo}
                                alt="MyZANOV"
                                className="h-10 w-auto opacity-90"
                            />
                        </div>
                    </div>

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
