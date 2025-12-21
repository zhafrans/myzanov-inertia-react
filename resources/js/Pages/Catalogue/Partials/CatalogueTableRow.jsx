import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { router } from "@inertiajs/react"
import { toast } from "react-toastify"
import EditCatalogueModal from "../EditCatalogueModal"
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
} from "@/components/ui/alert-dialog"

export default function CatalogueTableRow({ item }) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

    const handleEditClick = e => {
        e.stopPropagation()
        setOpenEdit(true)
    }

    const handleDeleteClick = e => {
        e.stopPropagation()
        setOpenDelete(true)
    }

    const handleDelete = () => {
        router.delete(route("products.destroy", item.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false)
                toast.success("Produk berhasil dihapus!")
            },
            onError: () => {
                toast.error("Gagal menghapus produk. Silakan coba lagi.")
            },
        })
    }

    const cashPrice = item.cash_price ?? item.cashPrice ?? 0
    const creditPrice = item.credit_price ?? item.creditPrice ?? 0

    return (
        <>
            <TableRow className="hover:bg-muted/50">
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category || "-"}</TableCell>
                <TableCell>{item.gender || "-"}</TableCell>
                <TableCell>{item.material || "-"}</TableCell>

                <TableCell>
                    {cashPrice ? `Rp ${Number(cashPrice).toLocaleString("id-ID")}` : "-"}
                </TableCell>

                <TableCell className="font-semibold">
                    {creditPrice ? `Rp ${Number(creditPrice).toLocaleString("id-ID")}` : "-"}
                </TableCell>

                <TableCell>
                    {item.image_url || item.image ? (
                        <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                            No Image
                        </div>
                    )}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleEditClick}
                            className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleDeleteClick}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-4 h-4" />
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
                </TableCell>
            </TableRow>

            {/* Edit Modal */}
            <EditCatalogueModal
                open={openEdit}
                setOpen={setOpenEdit}
                data={item}
            />
        </>
    )
}
