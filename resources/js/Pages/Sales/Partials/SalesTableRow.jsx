import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, FilePlus, Trash2 } from "lucide-react"
import { useState } from "react"
import { router } from "@inertiajs/react"
import EditSalesModal from "../EditSalesModal"
import InputInstallmentModal from "../InputInstallmentModal"
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

export default function SalesTableRow({ item }) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openTagihan, setOpenTagihan] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

    const handleEditClick = e => {
        e.stopPropagation()
        setOpenEdit(true)
    }

    const handleTagihanClick = e => {
        e.stopPropagation()
        setOpenTagihan(true)
    }

    const handleDeleteClick = e => {
        e.stopPropagation()
        setOpenDelete(true)
    }

    const handleDelete = () => {
        router.delete(route('sales.destroy', item.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false)
            }
        })
    }

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.visit(route('sales.show', item.id))}
            >
                <TableCell>{item.cardNo}</TableCell>
                <TableCell>{item.sales}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell className="max-w-xs truncate">{item.address}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                <TableCell className={`font-semibold ${item.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rp {item.remaining.toLocaleString()}
                </TableCell>

                {/* Actions */}
                <TableCell className="flex gap-2">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={handleEditClick}
                        className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>

                    {item.remaining > 0 && (
                        <Button
                            size="icon"
                            variant="secondary"
                            onClick={handleTagihanClick}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Input Tagihan"
                        >
                            <FilePlus className="w-4 h-4" />
                        </Button>
                    )}

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
                                <AlertDialogTitle>Hapus Sales?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus sales ini? 
                                    Aksi ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
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
                </TableCell>
            </TableRow>

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
                remainingAmount={item.remaining}
            />
        </>
    )
}