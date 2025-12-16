import AppLayout from "@/Layouts/AppLayout"
import SummaryCards from "./Partials/SummaryCards"
import MonthlySalesChart from "./Partials/MonthlySalesChart"
import SalesPieChart from "./Partials/SalesPieChart"
import TopProduct from "./Partials/TopSize"
import TopSize from "./Partials/TopSize"
import TopColor from "./Partials/TopColor"
import TopCity from "./Partials/TopCity"
import TopSubdistrict from "./Partials/TopSubdistrict"

export default function Dashboard() {
    const stats = {
        totalTanggungan: "Rp 12.500.000",
        totalTerjual: 320,
        belumLunas: 45,
        sudahLunas: 275,

        monthlySales: {
        months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
        series: [
            {
                name: "Umi",
                data: [10, 15, 20, 18, 22, 25],
            },
            {
                name: "Bihan",
                data: [8, 12, 15, 14, 18, 20],
            },
            {
                name: "Dilham",
                data: [12, 18, 22, 20, 25, 30],
            },
            {
                name: "Ati",
                data: [6, 10, 13, 12, 15, 20],
            },
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
    }

    return (
        <div className="space-y-6">
            <SummaryCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MonthlySalesChart data={stats.monthlySales} />
                </div>
                <SalesPieChart data={stats.salesByUser} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TopProduct data={stats.topProduct} />
                <TopSize data={stats.topSize} />
                <TopColor data={stats.topColor} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TopCity data={stats.topCity} />
                <TopSubdistrict data={stats.topSubdistrict} />
            </div>
        </div>
    )
}

Dashboard.layout = page => (
    <AppLayout title="Dashboard">
        {page}
    </AppLayout>
)
