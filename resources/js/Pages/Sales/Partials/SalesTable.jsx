import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Pencil, FilePlus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import SalesTableRow from "./SalesTableRow";
import SalesFilters from "./SalesFilters";
import SalesPagination from "./SalesPagination";
import { router, usePage } from "@inertiajs/react";
import EditSalesModal from "../EditSalesModal";
import InputInstallmentModal from "../InputInstallmentModal";
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
import { toast } from "react-toastify";

import CreateModal from "../CreateModal";

// Mobile Card Component
function SalesMobileCard({ item, collectors }) {
    const [openEdit, setOpenEdit] = useState(false);
    const [openTagihan, setOpenTagihan] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleEditClick = (e) => {
        e.stopPropagation();
        setOpenEdit(true);
    };

    const handleTagihanClick = (e) => {
        e.stopPropagation();
        setOpenTagihan(true);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setOpenDelete(true);
    };

    const handleDelete = () => {
        router.delete(route("sales.destroy", item.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false);
                toast.success("Sales berhasil dihapus!");
            },
            onError: () => {
                toast.error("Gagal menghapus sales. Silakan coba lagi.");
            },
        });
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
        <>
            <div className="w-full px-6 border-x-0 border-y rounded-none first:border-t last:border-b bg-card hover:bg-muted/50 active:bg-muted transition-colors py-3">
                <div
                    onClick={() => router.visit(route("sales.show", item.id))}
                    className="cursor-pointer"
                >
                    {/* Card No & Customer Name */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">
                                Card No
                            </p>
                            <p className="text-sm font-semibold truncate">
                                {item.card_number || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Customer Name */}
                    <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Customer
                        </p>
                        <p className="text-sm font-medium truncate">
                            {item.customer_name || "-"}
                        </p>
                    </div>

                    {/* Phone */}
                    <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Phone
                        </p>
                        <p className="text-xs font-medium truncate">
                            {item.customer?.phone || item.phone || "-"}
                        </p>
                    </div>

                    {/* Alamat */}
                    <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Alamat
                        </p>
                        <p className="text-xs text-foreground line-clamp-2">
                            {item.address || "-"}
                            {item.subdistrict_name && item.city_name && (
                                <span className="text-muted-foreground">
                                    {" "}
                                    - {item.subdistrict_name}, {item.city_name}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Tanggal Ambil & Sisa Tagihan */}
                    <div className="flex items-center justify-between mb-2 gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-0.5">
                                Tanggal Ambil
                            </p>
                            <p className="text-xs font-medium">
                                {formatDate(item.date)}
                            </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-muted-foreground mb-0.5">
                                Sisa Tagihan
                            </p>
                            <p
                                className={`text-sm font-bold ${
                                    item.remaining > 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                }`}
                            >
                                Rp {item.remaining?.toLocaleString("id-ID") || "0"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditClick}
                        className="flex-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 text-xs h-8"
                    >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                    </Button>
                    {item.remaining > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleTagihanClick}
                            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-8"
                        >
                            <FilePlus className="w-3 h-3 mr-1" />
                            Tagihan
                        </Button>
                    )}
                    <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDeleteClick}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 px-2"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Hapus Sales?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus sales ini?
                                    Aksi ini tidak dapat dibatalkan dan akan
                                    menghapus semua data terkait.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Edit Modal */}
            <EditSalesModal
                open={openEdit}
                setOpen={setOpenEdit}
                saleId={item.id}
                saleData={item}
            />

            {/* Input Tagihan Modal */}
            <InputInstallmentModal
                open={openTagihan}
                setOpen={setOpenTagihan}
                salesId={item.id}
                collectors={collectors}
                remainingAmount={item.remaining}
            />
        </>
    );
}

export default function SalesTable() {
    const { sales, filters: initialFilters, collectors } = usePage().props;

    const [filters, setFilters] = useState({
        sort: initialFilters.sort || "desc",
        status: initialFilters.status || "all",
        payment_type: initialFilters.payment_type || "all",
        notCollectedThisMonth: initialFilters.notCollectedThisMonth || false,
        startDate: initialFilters.startDate || "",
        endDate: initialFilters.endDate || "",
    });

    const [search, setSearch] = useState(initialFilters.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(
        initialFilters.search || ""
    );
    const [loading, setLoading] = useState(false);

    // DEBOUNCE SEARCH
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

        setLoading(true);
        router.get(route("sales.index"), params, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    }, [filters, debouncedSearch]);

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            ...filters,
            search: debouncedSearch,
        });

        window.location.href = route("sales.export") + "?" + params.toString();
    };

    return (
        <div className="space-y-4 md:space-y-4 overflow-x-hidden">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:justify-between -mx-6 md:mx-0 px-6 md:px-0">
                <Input
                    placeholder="Cari card no / sales / produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:max-w-xs"
                />

                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        size="sm"
                        className="flex-1 md:flex-initial text-green-600 hover:text-green-700 text-xs md:text-sm"
                    >
                        <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    <div className="flex-1 md:flex-initial">
                        <CreateModal />
                    </div>
                    <div className="flex-1 md:flex-initial">
                        <SalesFilters
                            filters={filters}
                            setFilters={handleFilterChange}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE - Desktop */}
            <div className="hidden md:block border rounded-lg overflow-x-auto relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Card No</TableHead>
                            <TableHead>Nama Customer</TableHead>
                            <TableHead>Sales</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Tgl Ambil</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Sisa</TableHead>
                            <TableHead>Terakhir Ditagih</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {sales.data.map((item) => (
                            <SalesTableRow
                                key={item.id}
                                item={item}
                                collectors={collectors}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE LIST VIEW */}
            <div className="md:hidden space-y-0 overflow-hidden -mx-6 md:mx-0 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
                {sales.data && sales.data.length > 0 ? (
                    sales.data.map((item) => (
                        <SalesMobileCard
                            key={item.id}
                            item={item}
                            collectors={collectors}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Tidak ada data sales
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {sales.links && sales.links.length > 1 && (
                <SalesPagination links={sales.links} />
            )}
        </div>
    );
}
