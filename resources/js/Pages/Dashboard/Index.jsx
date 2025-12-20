import AppLayout from "@/Layouts/AppLayout";
import SummaryCards from "./Partials/SummaryCards";
import MonthlySalesChart from "./Partials/MonthlySalesChart";
import SalesPieChart from "./Partials/SalesPieChart";
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

            // Tambahkan limit untuk setiap top card
            params.append("top_product_limit", limits.topProduct);
            params.append("top_size_limit", limits.topSize);
            params.append("top_color_limit", limits.topColor);
            params.append("top_city_limit", limits.topCity);
            params.append("top_subdistrict_limit", limits.topSubdistrict);

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
    }, [filters, limits]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // Reset limit ke default 5 saat filter berubah
        setLimits({
            topProduct: 5,
            topSize: 5,
            topColor: 5,
            topCity: 5,
            topSubdistrict: 5,
        });
    };

    // Handler untuk menambah limit +5
    const handleLoadMore = (cardType) => {
        setLimits((prev) => ({
            ...prev,
            [cardType]: prev[cardType] + 5,
        }));
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <TopProduct 
                            data={stats.topProduct} 
                            loading={loading} 
                            onLoadMore={() => handleLoadMore('topProduct')}
                            currentLimit={limits.topProduct}
                        />
                        <TopSize 
                            data={stats.topSize} 
                            loading={loading} 
                            onLoadMore={() => handleLoadMore('topSize')}
                            currentLimit={limits.topSize}
                        />
                        <TopColor 
                            data={stats.topColor} 
                            loading={loading} 
                            onLoadMore={() => handleLoadMore('topColor')}
                            currentLimit={limits.topColor}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <TopCity 
                            data={stats.topCity} 
                            loading={loading} 
                            onLoadMore={() => handleLoadMore('topCity')}
                            currentLimit={limits.topCity}
                        />
                        <TopSubdistrict
                            data={stats.topSubdistrict}
                            loading={loading}
                            onLoadMore={() => handleLoadMore('topSubdistrict')}
                            currentLimit={limits.topSubdistrict}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout title="Dashboard">{page}</AppLayout>;
