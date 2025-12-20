import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, FilePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { router } from "@inertiajs/react";
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

export default function SalesTableRow({ item, collectors }) {
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
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.visit(route("sales.show", item.id))}
            >
                <TableCell>{item.card_number}</TableCell>
                <TableCell>{item.customer_name || "-"}</TableCell>
                <TableCell>{item.sales}</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {item.product} - {item.color}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Size: {item.size || "-"}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="max-w-xs">
                    <div className="flex flex-col">
                        <span>{item.address}</span>
                        <span className="text-xs text-muted-foreground">
                            {[item.subdistrict_name, item.city_name]
                                .filter(Boolean)
                                .join(", ") || "-"}
                        </span>
                    </div>
                </TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                <TableCell
                    className={`font-semibold ${
                        item.remaining > 0 ? "text-red-600" : "text-green-600"
                    }`}
                >
                    Rp {item.remaining.toLocaleString()}
                </TableCell>
                <TableCell>
                    {item.last_installment_is_dp ? (
                        <div className="flex flex-col">
                            <span className="font-medium text-blue-600">
                                DP: Rp{" "}
                                {item.last_installment_amount.toLocaleString(
                                    "id-ID"
                                )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDate(item.last_collected_at)}
                            </span>
                        </div>
                    ) : item.last_collected_at ? (
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {formatDate(item.last_collected_at)}
                            </span>
                            {item.last_installment_amount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    Rp{" "}
                                    {item.last_installment_amount.toLocaleString(
                                        "id-ID"
                                    )}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
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
                collectors={collectors}
                remainingAmount={item.remaining}
            />
        </>
    );
}
