import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { router } from "@inertiajs/react"

export default function EditSalesModal({ open, setOpen, saleId, saleData }) {
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Initialize form dengan data dari props
    useEffect(() => {
        if (open && saleData) {
            setForm({
                card_number: saleData.card_number || '',
                customer_name: saleData.customer_name || '',
                address: saleData.address || '',
                price: saleData.price || 0,
                payment_type: saleData.payment_type || '',
                status: saleData.status || '',
                transaction_at: saleData.transaction_at ? 
                    saleData.transaction_at.split(' ')[0] : 
                    new Date().toISOString().split('T')[0],
                is_tempo: saleData.is_tempo || 'no',
                tempo_at: saleData.tempo_at || '',
                note: saleData.note || '',
                seller_id: saleData.seller_id || '',
            })
            setErrors({})
        }
    }, [open, saleData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    const handleSelectChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        router.put(route('sales.update', saleId), form, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false)
                setLoading(false)
            },
            onError: (errors) => {
                setErrors(errors)
                setLoading(false)
            },
            onFinish: () => setLoading(false),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Sales</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Invoice: {saleData?.invoice}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Card Number */}
                    <div className="space-y-2">
                        <Label htmlFor="card_number">No Kartu</Label>
                        <Input
                            id="card_number"
                            name="card_number"
                            value={form.card_number || ''}
                            onChange={handleChange}
                            className={errors.card_number ? "border-red-500" : ""}
                        />
                        {errors.card_number && (
                            <p className="text-sm text-red-500">{errors.card_number}</p>
                        )}
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Nama Customer</Label>
                        <Input
                            id="customer_name"
                            name="customer_name"
                            value={form.customer_name || ''}
                            onChange={handleChange}
                            className={errors.customer_name ? "border-red-500" : ""}
                        />
                        {errors.customer_name && (
                            <p className="text-sm text-red-500">{errors.customer_name}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Textarea
                            id="address"
                            name="address"
                            value={form.address || ''}
                            onChange={handleChange}
                            rows={3}
                            className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">{errors.address}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Harga</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            value={form.price || ''}
                            onChange={handleChange}
                            className={errors.price ? "border-red-500" : ""}
                        />
                        {errors.price && (
                            <p className="text-sm text-red-500">{errors.price}</p>
                        )}
                    </div>

                    {/* Grid untuk Payment Type, Status, Transaction Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment_type">Tipe Pembayaran</Label>
                            <Select
                                value={form.payment_type}
                                onValueChange={(value) => handleSelectChange('payment_type', value)}
                            >
                                <SelectTrigger className={errors.payment_type ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="tempo">Tempo</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.payment_type && (
                                <p className="text-sm text-red-500">{errors.payment_type}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
                            >
                                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-red-500">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="transaction_at">Tanggal Transaksi</Label>
                            <Input
                                id="transaction_at"
                                name="transaction_at"
                                type="date"
                                value={form.transaction_at || ''}
                                onChange={handleChange}
                                className={errors.transaction_at ? "border-red-500" : ""}
                            />
                            {errors.transaction_at && (
                                <p className="text-sm text-red-500">{errors.transaction_at}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="is_tempo">Tempo</Label>
                            <Select
                                value={form.is_tempo}
                                onValueChange={(value) => handleSelectChange('is_tempo', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Ya</SelectItem>
                                    <SelectItem value="no">Tidak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tempo Date jika is_tempo = yes */}
                    {form.is_tempo === 'yes' && (
                        <div className="space-y-2">
                            <Label htmlFor="tempo_at">Tanggal Tempo</Label>
                            <Input
                                id="tempo_at"
                                name="tempo_at"
                                type="date"
                                value={form.tempo_at || ''}
                                onChange={handleChange}
                                className={errors.tempo_at ? "border-red-500" : ""}
                            />
                            {errors.tempo_at && (
                                <p className="text-sm text-red-500">{errors.tempo_at}</p>
                            )}
                        </div>
                    )}

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Catatan</Label>
                        <Textarea
                            id="note"
                            name="note"
                            value={form.note || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tambahkan catatan jika perlu"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}