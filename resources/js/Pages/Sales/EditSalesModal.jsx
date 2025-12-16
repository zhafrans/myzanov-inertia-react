import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function EditSalesModal({ open, setOpen, data }) {
    const [form, setForm] = useState({ ...data })

    const handleChange = e => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = () => {
        console.log("SUBMIT EDIT SALES:", form)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Sales</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {[
                        { label: "Card No", name: "cardNo" },
                        { label: "Sales", name: "sales" },
                        { label: "Product", name: "product" },
                        { label: "Color", name: "color" },
                        { label: "Address", name: "address" },
                        { label: "Date", name: "date" },
                        { label: "Price", name: "price" },
                        { label: "Remaining", name: "remaining" },
                    ].map(field => (
                        <div key={field.name} className="flex flex-col space-y-1">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
