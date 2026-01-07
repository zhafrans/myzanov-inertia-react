import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { router } from "@inertiajs/react";

export default function DeleteInstallmentModal({ open, setOpen, saleId, installment, onSuccess }) {
    const handleDelete = () => {
        router.delete(
            route("sales.installments.destroy", { saleId: saleId, installmentId: installment.id }),
            {
                onSuccess: () => {
                    setOpen(false);
                    onSuccess();
                },
                onError: (errors) => {
                    console.error("Error deleting installment:", errors);
                },
            }
        );
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Angsuran</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus angsuran ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Angsuran ke:</span>
                            <Badge variant="outline">
                                {installment.number || '-'}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Nominal:</span>
                            <span className="font-semibold text-red-600">
                                Rp {installment.amount?.toLocaleString('id-ID')}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tanggal:</span>
                            <span className="text-sm">
                                {installment.date || '-'}
                            </span>
                        </div>
                        
                        {installment.is_dp && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Tipe:</span>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                    DP
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

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
    );
}
