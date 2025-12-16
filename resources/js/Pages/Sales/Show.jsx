import AppLayout from "@/Layouts/AppLayout"
import SalesDetailInfo from "./Partials/SalesDetailInfo"
import SalesInstallments from "./Partials/SalesInstallments"
import { Button } from "@/components/ui/button"
import { Printer, FilePlus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import InputInstallmentModal from "./InputInstallmentModal"

export default function SalesShow({ id }) {
    const [openTagihan, setOpenTagihan] = useState(false)
    const [tagihanForm, setTagihanForm] = useState({
        date: "",
        nominal: "",
        collector: "",
    })

    const salesData = {
        customer: {
            cardNo: "0610",
            name: "B. DIDIN",
            phone: "-",
        },
        address: {
            street: "SD 4 SUMINGKIR RANDUDONGKAL",
            subdistrict: "RANDUDONGKAL",
            city: "PEMALANG",
        },
        salesName: "UMI",
        items: [
            { product: "A551", color: "H", size: "41", price: 125000 },
            { product: "A552", color: "Hitam", size: "40", price: 100000 },
        ],
        remaining: 0,
        installments: [
            {
                number: 1,
                date: "08-06-2023",
                amount: 225000,
                collector: "UMI",
            },
        ],
    }

    const handlePrint = () => {
        window.print()
    }

    const handleTagihanChange = e => {
        const { name, value } = e.target
        setTagihanForm(prev => ({ ...prev, [name]: value }))
    }

    const handleTagihanSubmit = () => {
        console.log("Input Tagihan:", tagihanForm)
        setOpenTagihan(false)
        // nanti pakai router.post(...) untuk menyimpan
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                    Detail Sales
                </h1>

                <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>

                    <Button
                        onClick={() => setOpenTagihan(true)}
                        variant="secondary"
                    >
                        <FilePlus className="w-4 h-4 mr-2" />
                        Input Tagihan
                    </Button>
                </div>
            </div>

            {/* CONTENT */}
            <SalesDetailInfo data={salesData} />
            <SalesInstallments data={salesData} />

            {/* MODAL INPUT TAGIHAN */}
            {/* <Dialog open={openTagihan} onOpenChange={setOpenTagihan}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Input Tagihan</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="date">Tanggal Angsuran</Label>
                            <Input
                                type="date"
                                id="date"
                                name="date"
                                value={tagihanForm.date}
                                onChange={handleTagihanChange}
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="nominal">Nominal</Label>
                            <Input
                                type="number"
                                id="nominal"
                                name="nominal"
                                value={tagihanForm.nominal}
                                onChange={handleTagihanChange}
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="collector">Nama Collector</Label>
                            <Input
                                id="collector"
                                name="collector"
                                value={tagihanForm.collector}
                                onChange={handleTagihanChange}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleTagihanSubmit}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}

            <InputInstallmentModal
                open={openTagihan}
                setOpen={setOpenTagihan}
                salesId={id}
            />
        </div>
    )
}

SalesShow.layout = page => (
    <AppLayout title="Detail Sales">
        {page}
    </AppLayout>
)
