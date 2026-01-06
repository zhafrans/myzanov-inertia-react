import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, FilePlus, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
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
import { canEditSales, canInputInstallment, canDeleteSales } from "@/lib/userRoles";

export default function SalesTableRow({ item, collectors }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
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

    const handleDelete = (e) => {
        e.stopPropagation();
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

    const calculateDaysUntilDue = (tempoAt) => {
        if (!tempoAt) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(tempoAt);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    const getTempoDisplay = (tempoAt) => {
        if (!tempoAt) return { date: "-", daysText: null, isOverdue: false };
        
        const daysUntil = calculateDaysUntilDue(tempoAt);
        const isOverdue = daysUntil < 0;
        
        let daysText = null;
        if (daysUntil > 0) {
            daysText = `${daysUntil} hari lagi`;
        } else if (daysUntil < 0) {
            daysText = `${Math.abs(daysUntil)} hari yang lalu`;
        } else {
            daysText = "Hari ini";
        }
        
        return {
            date: formatDate(tempoAt),
            daysText,
            isOverdue,
        };
    };

    return (
        <>
            <TableRow
                className={`cursor-pointer hover:bg-muted/50 ${
                    item.is_return ? "bg-red-50 hover:bg-red-100" : ""
                }`}
                onClick={() => router.visit(route("sales.show", item.id))}
            >
                <TableCell>{item.card_number}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {item.customer_name || "-"}
                        {item.is_return && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-400 to-red-600 text-white">
                                RETURN
                            </span>
                        )}
                    </div>
                </TableCell>
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
                                {item.last_collector_name && (
                                    <span className="ml-1 text-xs">
                                        - {item.last_collector_name}
                                    </span>
                                )}
                            </span>
                        </div>
                    ) : item.last_collected_at ? (
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {formatDate(item.last_collected_at)}
                                {item.last_collector_name && (
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                        - {item.last_collector_name}
                                    </span>
                                )}
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
                <TableCell>
                    {(() => {
                        const tempo = getTempoDisplay(item.tempo_at);
                        if (!item.tempo_at) {
                            return <span className="text-muted-foreground">-</span>;
                        }
                        return (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    {tempo.isOverdue && (
                                        <Clock className="w-4 h-4 text-red-600" />
                                    )}
                                    <span
                                        className={`font-medium ${
                                            tempo.isOverdue
                                                ? "text-red-600"
                                                : "text-foreground"
                                        }`}
                                    >
                                        {tempo.date}
                                    </span>
                                </div>
                                {tempo.daysText && (
                                    <span
                                        className={`text-xs ${
                                            tempo.isOverdue
                                                ? "text-red-600"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {tempo.daysText}
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </TableCell>

                {/* Actions */}
                <TableCell className="flex gap-2">
                    {!item.is_return && canEditSales(user) && (
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleEditClick}
                            className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    )}

                    {!item.is_return && item.remaining > 0 && canInputInstallment(user) && (
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

                    {!item.is_return && canDeleteSales(user) && (
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(e);
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
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
