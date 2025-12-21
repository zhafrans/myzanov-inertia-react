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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import CataloguePagination from "./CataloguePagination";
import CatalogueTableRow from "./CatalogueTableRow";

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
            <div className="flex flex-wrap gap-3 justify-between">
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

            {/* TABLE */}
            <div className="border rounded-lg">
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

            {/* PAGINATION */}
            {products && products.links && (
                <CataloguePagination links={products.links} />
            )}
        </div>
    );
}
