import { Head } from "@inertiajs/react";
import CollectorLayout from "@/Layouts/CollectorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    TrendingUp, 
    TrendingDown, 
    CreditCard, 
    Users, 
    MapPin,
    CheckCircle,
    XCircle,
    BarChart3,
    Map
} from "lucide-react";

export default function CardStatistics({ statistics }) {
    const { total, per_seller, top_subdistricts, top_cities } = statistics;

    return (
        <CollectorLayout title="Statistik Kartu">
            <Head title="Statistik Kartu" />

            <div className="space-y-6 -mx-6 md:mx-0 px-6 md:px-0">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Statistik Kartu</h1>
                        <p className="text-muted-foreground">
                            Overview statistik kartu berdasarkan status pembayaran
                        </p>
                    </div>
                </div>

                {/* Total Statistics Cards */}
                <div className="grid gap-6 md:grid-cols-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kartu Belum Lunas</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{total.unpaid_cards.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {total.unpaid_percentage}% dari total kartu
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics per Seller */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Statistik Belum Lunas
                        </CardTitle>
                        <CardDescription>
                            Rincian statistik kartu untuk setiap sales yang belum lunas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {per_seller.length > 0 ? (
                                per_seller.map((seller) => (
                                    <div key={seller.seller_id} className="space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{seller.seller_name}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                    <span>{seller.unpaid}</span>
                                                    <span className="text-muted-foreground">({seller.unpaid_percentage}% dari total kartu {seller.seller_name})</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Tidak ada data sales tersedia
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Subdistricts with Unpaid Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Top 10 Kecamatan dengan Kartu Belum Lunas Terbanyak
                        </CardTitle>
                        <CardDescription>
                            Kecamatan dengan jumlah kartu belum lunas tertinggi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {top_subdistricts.length > 0 ? (
                                top_subdistricts.map((subdistrict, index) => (
                                    <div key={subdistrict.subdistrict_id} className="space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-left">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{subdistrict.subdistrict_name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {subdistrict.city_name && `, ${subdistrict.city_name}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-red-600">
                                                    {subdistrict.unpaid_count.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {subdistrict.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                        {index < top_subdistricts.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Tidak ada data kecamatan dengan kartu belum lunas
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Cities with Unpaid Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Map className="w-5 h-5" />
                            Top 10 Kabupaten/Kota dengan Kartu Belum Lunas Terbanyak
                        </CardTitle>
                        <CardDescription>
                            Kabupaten/Kota dengan jumlah kartu belum lunas tertinggi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {top_cities.length > 0 ? (
                                top_cities.map((city, index) => (
                                    <div key={city.city_id} className="space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-left">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{city.city_name}</span>
                                                    <span className="text-xs text-gray-500">kabupaten</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-red-600">
                                                    {city.unpaid_count.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {city.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                        {index < top_cities.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Tidak ada data kabupaten/kota dengan kartu belum lunas
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CollectorLayout>
    );
}
