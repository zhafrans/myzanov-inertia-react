import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import EditInstallmentModal from "../EditInstallmentModal";
import { canInputInstallment } from "@/lib/userRoles";

export default function SalesInstallments({
    data,
    installments,
    saleId,
    collectors,
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const installmentsData = installments || data.installments || [];
    const [editingInstallment, setEditingInstallment] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (installmentsData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada riwayat pembayaran</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-base md:text-lg font-semibold">Riwayat Pembayaran</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                    Total {installmentsData.length} kali pembayaran
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {installmentsData.map((installment, index) => (
                    <Card
                        key={installment.id || index}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base">
                                    Angsuran {installment.number || index + 1}
                                    {installment.is_dp && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                                            DP
                                        </span>
                                    )}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    #{String(installment.number || index + 1).padStart(2, "0")}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="text-xs md:text-sm space-y-2">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
                                <span className="text-muted-foreground text-xs md:text-sm">
                                    Tanggal:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs md:text-sm">
                                        {installment.date}
                                    </span>
                                    {saleId && installment.id && canInputInstallment(user) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 md:h-6 md:w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => {
                                                setEditingInstallment(
                                                    installment
                                                );
                                                setIsEditModalOpen(true);
                                            }}
                                            title="Edit tanggal"
                                        >
                                            <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
                                <span className="text-muted-foreground text-xs md:text-sm">
                                    Nominal:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-green-600 text-xs md:text-sm">
                                        Rp{" "}
                                        {installment.amount?.toLocaleString()}
                                    </span>
                                    {saleId && installment.id && canInputInstallment(user) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 md:h-6 md:w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => {
                                                setEditingInstallment(
                                                    installment
                                                );
                                                setIsEditModalOpen(true);
                                            }}
                                            title="Edit nominal"
                                        >
                                            <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
                                <span className="text-muted-foreground text-xs md:text-sm">
                                    Collector:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs md:text-sm truncate">
                                        {installment.collector}
                                    </span>
                                    {saleId && installment.id && canInputInstallment(user) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 md:h-6 md:w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                                            onClick={() => {
                                                setEditingInstallment(
                                                    installment
                                                );
                                                setIsEditModalOpen(true);
                                            }}
                                            title="Edit collector"
                                        >
                                            <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {installment.payment_date && (
                                <div className="pt-2 border-t text-xs text-muted-foreground">
                                    Dibayar:{" "}
                                    {new Date(
                                        installment.payment_date
                                    ).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Installment Modal */}
            {saleId && editingInstallment && (
                <EditInstallmentModal
                    open={isEditModalOpen}
                    setOpen={setIsEditModalOpen}
                    saleId={saleId}
                    installmentId={editingInstallment.id}
                    installmentData={editingInstallment}
                    collectors={collectors}
                    remainingAmount={data.remaining}
                    onSuccess={() => {
                        setEditingInstallment(null);
                    }}
                />
            )}

            {/* Summary */}
            {data.totalPrice && data.remaining !== undefined && (
                <Card className="mt-4 md:mt-6">
                    <CardContent className="pt-4 md:pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Total Tagihan
                                </p>
                                <p className="text-base md:text-lg font-bold">
                                    Rp {data.totalPrice.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Total Dibayar
                                </p>
                                <p className="text-base md:text-lg font-bold text-green-600">
                                    Rp{" "}
                                    {(
                                        data.totalPrice - data.remaining
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Sisa Tagihan
                                </p>
                                <p
                                    className={`text-base md:text-lg font-bold ${
                                        data.isLunas
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    Rp {data.remaining.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
