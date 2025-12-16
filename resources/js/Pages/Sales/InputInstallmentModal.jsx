import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function InputInstallmentModal({ open, setOpen, salesId }) {
    const [tagihanForm, setTagihanForm] = useState({
        date: "",
        nominal: "",
        collector: "",
    })

    // Reset form tiap kali modal dibuka
    useEffect(() => {
        if (open) {
            setTagihanForm({
                date: "",
                nominal: "",
                collector: "",
            })
        }
    }, [open])

    const handleTagihanChange = e => {
        const { name, value } = e.target
        setTagihanForm(prev => ({ ...prev, [name]: value }))
    }

    const handleTagihanSubmit = () => {
        // Nanti bisa diganti router.post(...) untuk submit ke server
        console.log("INPUT TAGIHAN:", { salesId, ...tagihanForm })
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Input Tagihan</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Tanggal Angsuran */}
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

                    {/* Nominal */}
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

                    {/* Collector */}
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
        </Dialog>
    )
}
