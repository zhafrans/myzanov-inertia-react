import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import CollectorDataRow from "./CollectorDataRow";
import CollectorDataPagination from "./CollectorDataPagination";
import { router, usePage } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mobile Card Component
function CollectorDataMobileCard({ item }) {
    const handleRowClick = () => {
        router.get(route("sales.show", item.id));
    };

    return (
        <div 
            className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleRowClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-medium text-sm">{item.card_number || '-'}</div>
                    <div className="text-xs text-gray-500">{item.invoice}</div>
                </div>
                <div className="text-right">
                    <div className="font-medium text-sm">Rp {item.price.toLocaleString('id-ID')}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        item.remaining_amount > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                    }`}>
                        {item.remaining_amount > 0 ? 'Belum Lunas' : 'Lunas'}
                    </div>
                </div>
            </div>
            
            <div className="text-sm">
                <div className="font-medium">{item.customer_name}</div>
                <div className="text-gray-500 text-xs">{item.phone}</div>
                <div className="text-gray-500 text-xs">{item.address}</div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
                <div>
                    <div>Sales: {item.seller?.name}</div>
                    <div>{item.city?.name}, {item.subdistrict?.name}</div>
                </div>
                <div>
                    <div>{new Date(item.transaction_at).toLocaleDateString('id-ID')}</div>
                    <div>{item.payment_type}</div>
                </div>
            </div>

            {item.remaining_amount > 0 && (
                <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Sisa:</span>
                        <span className="font-medium text-red-600">
                            Rp {item.remaining_amount.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CollectorDataTable({ sales }) {
    const { url } = usePage();
    const [search, setSearch] = useState("");

    // Get search from URL params on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            setSearch(searchParam);
        }
    }, [url]);

    // Handle search with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            if (search) {
                urlParams.set('search', search);
            } else {
                urlParams.delete('search');
            }
            
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            router.get(newUrl, {}, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Memoized filtered data
    const filteredData = useMemo(() => {
        if (!sales?.data) return [];
        
        if (!search) return sales.data;
        
        const searchLower = search.toLowerCase();
        return sales.data.filter((item) => {
            return (
                item.invoice?.toLowerCase().includes(searchLower) ||
                item.card_number?.toLowerCase().includes(searchLower) ||
                item.customer_name?.toLowerCase().includes(searchLower) ||
                item.phone?.toLowerCase().includes(searchLower) ||
                item.address?.toLowerCase().includes(searchLower) ||
                item.payment_type?.toLowerCase().includes(searchLower) ||
                item.status?.toLowerCase().includes(searchLower) ||
                item.note?.toLowerCase().includes(searchLower) ||
                item.seller?.name?.toLowerCase().includes(searchLower) ||
                item.items?.some((i) => 
                    i.product_name?.toLowerCase().includes(searchLower) ||
                    i.color?.toLowerCase().includes(searchLower) ||
                    i.size?.toLowerCase().includes(searchLower)
                ) ||
                item.city?.name?.toLowerCase().includes(searchLower) ||
                item.subdistrict?.name?.toLowerCase().includes(searchLower)
            );
        });
    }, [sales?.data, search]);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="flex-1 max-w-sm">
                    <Input
                        placeholder="Cari invoice, nama, produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">No. Kartu</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Customer</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Sales</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Lokasi</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Nilai</TableHead>
                                <TableHead className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <CollectorDataRow key={item.id} item={item} />
                                ))
                            ) : (
                                <TableRow>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {search ? 'Tidak ada data yang cocok dengan pencarian' : 'Tidak ada data'}
                                    </td>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <CollectorDataMobileCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 border rounded-lg">
                        {search ? 'Tidak ada data yang cocok dengan pencarian' : 'Tidak ada data'}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {sales?.links && (
                <CollectorDataPagination links={sales.links} />
            )}
        </div>
    );
}
