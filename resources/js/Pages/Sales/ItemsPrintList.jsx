import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/Layouts/AppLayout";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ItemsPrintList() {
    const { items, filters: initialFilters, sellers } = usePage().props;

    const [filters, setFilters] = useState({
        search: initialFilters.search || "",
        perPage: initialFilters.perPage || 10,
        seller_id: initialFilters.seller_id || "all",
    });

    const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || "");
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.search]);

    const isFirstRender = useState(true);

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

        setLoading(true);
        router.get(route("sales.items.print-list"), params, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    }, [filters, debouncedSearch]);

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handlePrint = (saleId, itemId) => {
        // Open print route in new tab
        const printUrl = route('sales.items.print', { saleId, itemId });
        window.open(printUrl, '_blank');

        // Show success message
        toast.success("Item berhasil dicetak!");

        // Immediately reload the current page
        window.location.reload();
    };



    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">List Print Item</h1>
                <p className="text-muted-foreground">
                    Daftar item dengan tipe pembayaran Kredit dan Cash Tempo (tombol print hanya muncul untuk yang belum dicetak)
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Cari produk / invoice / card no / customer..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select
                        value={filters.seller_id}
                        onValueChange={(value) => handleFilterChange({ seller_id: value })}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by Sales" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Sales</SelectItem>
                            {sellers && sellers.map((seller) => (
                                <SelectItem key={seller.id} value={seller.id.toString()}>
                                    {seller.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <select
                        value={filters.perPage}
                        onChange={(e) => handleFilterChange({ perPage: parseInt(e.target.value) })}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        <option value={10}>10 per halaman</option>
                        <option value={25}>25 per halaman</option>
                        <option value={50}>50 per halaman</option>
                        <option value={100}>100 per halaman</option>
                    </select>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
            )}

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead>Warna</TableHead>
                            <TableHead>Ukuran</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Harga/Item</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Card No</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Sales</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Print Count</TableHead>
                            <TableHead>Last Printed</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">
                                    <div className="max-w-xs">
                                        <div className="line-clamp-2 text-sm">
                                            {item.product_name}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.color || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.size || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-sm">
                                    Rp {(item.price_per_item || 0).toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.sale?.transaction_at ? new Date(item.sale.transaction_at).toLocaleDateString('id-ID') : '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <Badge
                                        variant={item.sale?.payment_type === 'credit' ? 'default' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {item.sale?.payment_type === 'credit' ? 'Kredit' :
                                            item.sale?.payment_type === 'cash_tempo' ? 'Cash Tempo' :
                                                item.sale?.payment_type || '-'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm font-mono">
                                    {item.sale?.invoice || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.sale?.card_number || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="max-w-xs">
                                        <div className="line-clamp-1">
                                            {item.sale?.customer_name || '-'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.sale?.seller?.name ? (
                                        <div className="inline-flex items-center">
                                            {item.sale?.seller?.card_color ? (
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-medium"
                                                    style={{
                                                        backgroundColor: item.sale.seller.card_color.hex_color,
                                                        color: '#000',
                                                    }}
                                                >
                                                    {item.sale.seller.name}
                                                </span>
                                            ) : (
                                                <span>{item.sale.seller.name}</span>
                                            )}
                                        </div>
                                    ) : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant={item.print_count < 1 ? "destructive" : "secondary"}
                                        className="text-xs"
                                    >
                                        {item.print_count < 1 ? "Belum" : "Sudah"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-center">
                                    {item.print_count || 0}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {item.last_printed_at ? new Date(item.last_printed_at).toLocaleString('id-ID', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {item.print_count < 1 && (
                                        <Button
                                            onClick={() => handlePrint(item.sale_id, item.id)}
                                            size="sm"
                                            className="h-8 px-3 text-xs"
                                        >
                                            <Printer className="w-3 h-3 mr-1" />
                                            Cetak
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Empty State */}
            {items.data.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Printer className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada item</h3>
                    <p className="text-gray-500">
                        {filters.search
                            ? "Tidak ada item yang cocok dengan pencarian Anda."
                            : "Belum ada item yang tersedia."}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {items.links && items.links.length > 1 && (
                <>
                    {/* Mobile: Only show arrow buttons */}
                    <div className="md:hidden w-full flex items-center justify-between gap-4 py-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="default"
                            onClick={() => {
                                const previousLink = items.links.find(link =>
                                    link.label.includes('Previous') ||
                                    link.label.includes('pagination.previous') ||
                                    link.label.includes('&laquo;')
                                );
                                if (previousLink?.url) {
                                    router.get(previousLink.url, {}, { preserveState: true });
                                }
                            }}
                            disabled={!items.links.find(link =>
                                link.label.includes('Previous') ||
                                link.label.includes('pagination.previous') ||
                                link.label.includes('&laquo;')
                            )?.url}
                            className="flex-1"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="default"
                            onClick={() => {
                                const nextLink = items.links.find(link =>
                                    link.label.includes('Next') ||
                                    link.label.includes('pagination.next') ||
                                    link.label.includes('&raquo;')
                                );
                                if (nextLink?.url) {
                                    router.get(nextLink.url, {}, { preserveState: true });
                                }
                            }}
                            disabled={!items.links.find(link =>
                                link.label.includes('Next') ||
                                link.label.includes('pagination.next') ||
                                link.label.includes('&raquo;')
                            )?.url}
                            className="flex-1"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Desktop: Show full pagination */}
                    <div className="hidden md:flex justify-center">
                        <div className="flex gap-2">
                            {items.links.map((link, index) => (
                                <button
                                    key={index}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => {
                                        if (link.url) {
                                            const url = new URL(link.url);
                                            const params = Object.fromEntries(url.searchParams);
                                            router.get(link.url, params, {
                                                preserveState: true,
                                            });
                                        }
                                    }}
                                    className={`px-3 py-2 text-sm rounded-md ${link.active
                                            ? "bg-primary text-primary-foreground"
                                            : link.url
                                                ? "bg-secondary hover:bg-secondary/80"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        }`}
                                    disabled={!link.url}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

ItemsPrintList.layout = page => (
    <AppLayout title="List Print Item">
        {page}
    </AppLayout>
)
