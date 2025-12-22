import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import CataloguePagination from "./CataloguePagination";
import CatalogueTableRow from "./CatalogueTableRow";
import EditCatalogueModal from "../EditCatalogueModal";
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

// Mobile Card Component
function CatalogueMobileCard({ item }) {
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleEditClick = (e) => {
        e.stopPropagation();
        setOpenEdit(true);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setOpenDelete(true);
    };

    const handleDelete = () => {
        router.delete(route("products.destroy", item.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false);
                toast.success("Produk berhasil dihapus!");
            },
            onError: () => {
                toast.error("Gagal menghapus produk. Silakan coba lagi.");
            },
        });
    };

    const cashPrice = item.cash_price ?? item.cashPrice ?? 0;
    const creditPrice = item.credit_price ?? item.creditPrice ?? 0;

    return (
        <>
            <div className="w-full px-6 border-x-0 border-y rounded-none first:border-t last:border-b bg-card hover:bg-muted/50 active:bg-muted transition-colors py-3">
                {/* Image & Name */}
                <div className="flex items-start gap-3 mb-2">
                    {item.image_url || item.image ? (
                        <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                            No Image
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                            {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {item.category || "-"}
                        </p>
                    </div>
                </div>

                {/* Gender & Material */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Gender
                        </p>
                        <p className="text-xs font-medium">
                            {item.gender || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Bahan
                        </p>
                        <p className="text-xs font-medium">
                            {item.material || "-"}
                        </p>
                    </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Harga Cash
                        </p>
                        <p className="text-xs font-semibold">
                            {cashPrice
                                ? `Rp ${Number(cashPrice).toLocaleString("id-ID")}`
                                : "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                            Harga Kredit
                        </p>
                        <p className="text-xs font-semibold">
                            {creditPrice
                                ? `Rp ${Number(creditPrice).toLocaleString("id-ID")}`
                                : "-"}
                        </p>
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
                                    Hapus Produk?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus produk "{item.name}"?
                                    Aksi ini tidak dapat dibatalkan.
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
            <EditCatalogueModal
                open={openEdit}
                setOpen={setOpenEdit}
                data={item}
            />
        </>
    );
}

export default function CatalogueTable() {
    const { products, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(
        filters?.search || ""
    );
    const [isInitialMount, setIsInitialMount] = useState(true);

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Handle search with Inertia
    useEffect(() => {
        // Skip on initial mount to avoid unnecessary request
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }

        router.get(
            route("products.index"),
            { search: debouncedSearch || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch]);

    return (
        <div className="space-y-4">
            {/* TOOLBAR */}
            <div className="flex flex-wrap gap-3 justify-between -mx-6 md:mx-0 px-6 md:px-0">
                <Input
                    placeholder="Cari nama / kategori / bahan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />

                <Button
                    onClick={() => {
                        window.dispatchEvent(
                            new CustomEvent("openCreateModal")
                        );
                    }}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Produk
                </Button>
            </div>

            {/* TABLE - Desktop */}
            <div className="hidden md:block border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Bahan</TableHead>
                            <TableHead>Harga Cash</TableHead>
                            <TableHead>Harga Kredit</TableHead>
                            <TableHead>Gambar</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {products &&
                        products.data &&
                        products.data.length > 0 ? (
                            products.data.map((item) => (
                                <CatalogueTableRow key={item.id} item={item} />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    Tidak ada data produk
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-0 overflow-hidden -mx-6">
                {products &&
                products.data &&
                products.data.length > 0 ? (
                    products.data.map((item) => (
                        <CatalogueMobileCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground px-6">
                        Tidak ada data produk
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {products && products.links && (
                <CataloguePagination links={products.links} />
            )}
        </div>
    );
}
