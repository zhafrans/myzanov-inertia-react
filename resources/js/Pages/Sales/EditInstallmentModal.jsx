import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { router } from "@inertiajs/react"

export default function EditInstallmentModal({ open, setOpen, saleId, installmentId, installmentData, collectors, remainingAmount, onSuccess }) {
    const [form, setForm] = useState({
        installment_amount: "",
        payment_date: "",
        collector_id: "",
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Initialize form dengan data installment saat modal dibuka
    useEffect(() => {
        if (open && installmentData) {
            setForm({
                installment_amount: installmentData.amount?.toString() || installmentData.installment_amount?.toString() || "",
                payment_date: installmentData.payment_date || "",
                collector_id: installmentData.collector_id?.toString() || "",
            })
            setErrors({})
        }
    }, [open, installmentData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        // Clear error saat user mulai mengetik
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

    const validateForm = () => {
        const newErrors = {}
        
        if (!form.installment_amount || parseFloat(form.installment_amount) <= 0) {
            newErrors.installment_amount = "Nominal harus lebih dari 0"
        } else {
            // Hitung sisa tagihan setelah mengurangkan installment yang sedang diedit
            const currentInstallmentAmount = installmentData?.amount || installmentData?.installment_amount || 0
            const availableAmount = (remainingAmount || 0) + currentInstallmentAmount
            
            if (parseFloat(form.installment_amount) > availableAmount) {
                newErrors.installment_amount = `Nominal tidak boleh melebihi sisa tagihan yang tersedia (Rp ${availableAmount.toLocaleString()})`
            }
        }
        
        if (!form.payment_date) {
            newErrors.payment_date = "Tanggal harus diisi"
        }
        
        if (!form.collector_id) {
            newErrors.collector_id = "Collector harus dipilih"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setLoading(true)

        router.put(route('sales.installments.update', { saleId, installmentId }), {
            ...form,
            installment_amount: parseFloat(form.installment_amount)
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false)
                setLoading(false)
                
                // Tampilkan toast sukses
                if (typeof window !== 'undefined' && window.toast) {
                    window.toast.success('Installment berhasil diupdate!')
                }
                
                // Panggil callback onSuccess jika ada
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess()
                }
                
                // Reload halaman untuk update data
                router.reload({ only: ['sale'] })
            },
            onError: (errors) => {
                setErrors(errors)
                setLoading(false)
                
                // Tampilkan toast error
                if (typeof window !== 'undefined' && window.toast) {
                    window.toast.error('Gagal mengupdate installment. Silakan coba lagi.')
                }
            },
            onFinish: () => setLoading(false),
        })
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0)
    }

    // Hitung sisa tagihan yang tersedia untuk edit
    const currentInstallmentAmount = installmentData?.amount || installmentData?.installment_amount || 0
    const availableAmount = (remainingAmount || 0) + currentInstallmentAmount

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Edit Installment</DialogTitle>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Sisa tagihan tersedia: <span className="font-semibold text-blue-600">
                                {formatCurrency(availableAmount)}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Nominal saat ini: {formatCurrency(currentInstallmentAmount)}
                        </p>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Jumlah Tagihan */}
                    <div className="space-y-2">
                        <Label htmlFor="installment_amount" className="flex items-center justify-between">
                            <span>Jumlah Tagihan</span>
                            <span className="text-xs text-muted-foreground">
                                Maks: {formatCurrency(availableAmount)}
                            </span>
                        </Label>
                        <Input
                            id="installment_amount"
                            name="installment_amount"
                            type="number"
                            value={form.installment_amount}
                            onChange={handleChange}
                            placeholder="Masukkan jumlah"
                            className={errors.installment_amount ? "border-red-500 focus-visible:ring-red-500" : ""}
                            min="0"
                            max={availableAmount || undefined}
                            step="1000"
                        />
                        {errors.installment_amount && (
                            <p className="text-sm text-red-500">{errors.installment_amount}</p>
                        )}
                        <div className="flex justify-end">
                            <span className="text-xs text-muted-foreground">
                                Terbilang: {formatCurrency(form.installment_amount)}
                            </span>
                        </div>
                    </div>

                    {/* Tanggal Pembayaran */}
                    <div className="space-y-2">
                        <Label htmlFor="payment_date">Tanggal Pembayaran</Label>
                        <Input
                            id="payment_date"
                            name="payment_date"
                            type="date"
                            value={form.payment_date}
                            onChange={handleChange}
                            className={errors.payment_date ? "border-red-500 focus-visible:ring-red-500" : ""}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        {errors.payment_date && (
                            <p className="text-sm text-red-500">{errors.payment_date}</p>
                        )}
                    </div>

                    {/* Collector */}
                    <div className="space-y-2">
                        <Label htmlFor="collector_id">Penagih</Label>
                        <Select
                            value={form.collector_id}
                            onValueChange={(value) => handleSelectChange('collector_id', value)}
                        >
                            <SelectTrigger className={errors.collector_id ? "border-red-500 focus-visible:ring-red-500" : ""}>
                                <SelectValue placeholder="Pilih penagih" />
                            </SelectTrigger>
                            <SelectContent>
                                {collectors && collectors.length > 0 ? (
                                    collectors.map(collector => (
                                        <SelectItem 
                                            key={collector.id} 
                                            value={collector.id.toString()}
                                        >
                                            <div className="flex flex-col">
                                                <span>{collector.name}</span>
                                                {collector.email && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {collector.email}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Tidak ada collector tersedia
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.collector_id && (
                            <p className="text-sm text-red-500">{errors.collector_id}</p>
                        )}
                        {collectors && collectors.length === 0 && (
                            <p className="text-sm text-amber-600">
                                Tidak ada collector tersedia. Tambahkan collector terlebih dahulu.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="sm:flex-1"
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || !form.installment_amount || !form.collector_id}
                            className="sm:flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : "Update Installment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

