import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

const PaymentHistoryModal = ({ open, setOpen, paymentHistory }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentTypeColor = (type) => {
        switch (type) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'credit':
                return 'bg-blue-100 text-blue-800';
            case 'cash_tempo':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Riwayat Perubahan Tipe Pembayaran
                    </DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh]">
                    {paymentHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Belum ada riwayat perubahan tipe pembayaran</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paymentHistory.map((history) => (
                                <div
                                    key={history.id}
                                    className="border rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getPaymentTypeColor(history.from_payment_type)}>
                                                {history.from_payment_type.toUpperCase()}
                                            </Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <Badge className={getPaymentTypeColor(history.to_payment_type)}>
                                                {history.to_payment_type.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            #{history.id}
                                        </span>
                                    </div>
                                    
                                    {history.reason && (
                                        <p className="text-sm text-muted-foreground">
                                            {history.reason}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>{history.changed_by?.name || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            {formatDate(history.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentHistoryModal;
