import AppLayout from "@/Layouts/AppLayout";
import SalesDetailInfo from "./Partials/SalesDetailInfo";
import SalesInstallments from "./Partials/SalesInstallments";
import { Button } from "@/components/ui/button";
import { Printer, FilePlus, ArrowLeft, Edit } from "lucide-react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import InputInstallmentModal from "./InputInstallmentModal";
import EditSalesModal from "./EditSalesModal";
import { canEditSales, canInputInstallment } from "@/lib/userRoles";

export default function SalesShow() {
    const { auth, sale, collectors } = usePage().props;
    const user = auth.user;
    const [openTagihan, setOpenTagihan] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        router.visit(route("sales.index"));
    };

    const handleEdit = () => {
        setOpenEdit(true);
    };

    // Format data untuk komponen
    const formattedData = {
        customer: {
            cardNo: sale.card_number || sale.customer.cardNo,
            name: sale.customer_name || sale.customer.name,
            phone: sale.customer.phone || "-",
        },
        address: {
            street: sale.address || sale.address_info.street,
            subdistrict: sale.subdistrict_name || sale.address_info.subdistrict,
            city: sale.city_name || sale.address_info.city,
            province: sale.province_name || "",
            village: sale.village_name || "",
        },
        salesName: sale.seller || sale.salesName,
        items: sale.items || [],
        remaining: sale.remaining || 0,
        totalPrice: sale.price || 0,
        installments: sale.installments || [],
        isLunas: sale.is_lunas || sale.remaining <= 0,
        transactionDate: sale.transaction_date || sale.transaction_at,
        paymentType: sale.payment_type,
        status: sale.status,
        note: sale.note,
        isTempo: sale.is_tempo,
        tempoAt: sale.tempo_at,
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 -mx-6 md:mx-auto px-6 md:px-0">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-8 w-8 flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl font-bold truncate">
                            No Kartu - {sale.card_number || "No Card"}
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {sale.invoice} | {" "}
                            {sale.transaction_date}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canEditSales(user) && (
                        <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                            className="text-yellow-600 flex-1 md:flex-initial text-xs md:text-sm"
                        >
                            <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            Edit
                        </Button>
                    )}

                    <Button 
                        onClick={handlePrint} 
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-initial text-xs md:text-sm"
                    >
                        <Printer className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Print
                    </Button>

                    {!sale.is_lunas && canInputInstallment(user) && (
                        <Button
                            onClick={() => setOpenTagihan(true)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 md:flex-initial text-xs md:text-sm"
                        >
                            <FilePlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            Input Tagihan
                        </Button>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <SalesDetailInfo data={formattedData} />
            <SalesInstallments
                data={formattedData}
                installments={sale.installments}
                saleId={sale.id}
                collectors={collectors}
            />

            {/* MODAL INPUT TAGIHAN */}
            <InputInstallmentModal
                open={openTagihan}
                setOpen={setOpenTagihan}
                salesId={sale.id}
                collectors={collectors}
                remainingAmount={sale.remaining}
            />

            {/* MODAL EDIT SALES */}
            <EditSalesModal
                open={openEdit}
                setOpen={setOpenEdit}
                saleId={sale.id}
                saleData={sale}
            />
        </div>
    );
}

SalesShow.layout = (page) => <AppLayout title="Detail Sales">{page}</AppLayout>;
