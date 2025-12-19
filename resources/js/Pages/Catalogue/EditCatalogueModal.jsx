import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

export default function EditCatalogueModal({ open, setOpen, data }) {
    const [form, setForm] = useState({
        name: "",
        category: "",
        gender: "",
        material: "",
        cashPrice: "",
        creditPrice: "",
        image: "",
    })

    // sync ketika modal dibuka / data berubah
    useEffect(() => {
        if (open && data) {
            setForm({
                name: data.name ?? "",
                category: data.category ?? "",
                gender: data.gender ?? "",
                material: data.material ?? "",
                cashPrice: data.cashPrice ?? "",
                creditPrice: data.creditPrice ?? "",
                image: data.image ?? "",
            })
        }
    }, [open, data])

    const handleChange = e => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = () => {
        console.log("SUBMIT EDIT CATALOGUE:", form)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Catalogue</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                        <Label>Nama Produk</Label>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Kategori</Label>
                        <Input
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Gender</Label>
                        <Input
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1 col-span-2">
                        <Label>Bahan</Label>
                        <Input
                            name="material"
                            value={form.material}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Harga Cash</Label>
                        <Input
                            type="number"
                            name="cashPrice"
                            value={form.cashPrice}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Harga Kredit</Label>
                        <Input
                            type="number"
                            name="creditPrice"
                            value={form.creditPrice}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1 col-span-2">
                        <Label>URL Gambar</Label>
                        <Input
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                        />
                    </div>

                    {form.image && (
                        <div className="col-span-2">
                            <img
                                src={form.image}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
