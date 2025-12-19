import AppLayout from "@/Layouts/AppLayout"
import SalesDetailInfo from "./Partials/SalesDetailInfo"
import SalesInstallments from "./Partials/SalesInstallments"
import { Button } from "@/components/ui/button"
import { Printer, FilePlus, ArrowLeft, Edit } from "lucide-react"
import { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import InputInstallmentModal from "./InputInstallmentModal"
import EditSalesModal from "./EditSalesModal"

export default function SalesShow() {
    const { sale, collectors } = usePage().props;
    const [openTagihan, setOpenTagihan] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    const handlePrint = () => {
        window.print()
    }

    const handleBack = () => {
        router.visit(route('sales.index'))
    }

    const handleEdit = () => {
        setOpenEdit(true)
    }

    // Format data untuk komponen
    const formattedData = {
        customer: {
            cardNo: sale.card_number || sale.customer.cardNo,
            name: sale.customer_name || sale.customer.name,
            phone: sale.customer.phone || '-',
        },
        address: {
            street: sale.address || sale.address_info.street,
            subdistrict: sale.subdistrict_name || sale.address_info.subdistrict,
            city: sale.city_name || sale.address_info.city,
            province: sale.province_name || '',
            village: sale.village_name || '',
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
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Detail Sales - {sale.card_number || 'No Card'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Invoice: {sale.invoice} | Tanggal: {sale.transaction_date}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleEdit}
                        variant="outline"
                        className="text-yellow-600"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    
                    <Button 
                        onClick={handlePrint} 
                        variant="outline"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>

                    {!sale.is_lunas && (
                        <Button
                            onClick={() => setOpenTagihan(true)}
                            variant="secondary"
                        >
                            <FilePlus className="w-4 h-4 mr-2" />
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
    )
}

SalesShow.layout = page => (
    <AppLayout title="Detail Sales">
        {page}
    </AppLayout>
)