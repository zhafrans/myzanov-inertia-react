import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { router, usePage } from "@inertiajs/react"
import { Plus, Trash2 } from "lucide-react"
import axios from "axios"

export default function CreateModal() {
    const { auth } = usePage().props
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Location Data
    const [provinces, setProvinces] = useState([])
    const [cities, setCities] = useState([])
    const [subdistricts, setSubdistricts] = useState([])
    const [villages, setVillages] = useState([])

    const [items, setItems] = useState([
        { product_name: '', color: '', size: '', quantity: 1, price: 0 }
    ])

    const [form, setForm] = useState({
        card_number: '',
        customer_name: '',
        address: '',
        province_id: '',
        city_id: '',
        subdistrict_id: '',
        village_id: '',
        price: 0,
        payment_type: 'cash',
        status: 'pending',
        transaction_at: new Date().toISOString().split('T')[0],
        is_tempo: 'no',
        tempo_at: '',
        note: '',
        seller_id: auth.user.id,
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (open) {
            fetchProvinces()
        }
    }, [open])

    // Auto-calculate total price
    useEffect(() => {
        const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
        setForm(prev => ({ ...prev, price: total }))
    }, [items])

    const fetchProvinces = async () => {
        try {
            const res = await axios.get(route('locations.provinces'))
            setProvinces(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchCities = async (provinceId) => {
        if (!provinceId) return
        try {
            const res = await axios.get(route('locations.cities', provinceId))
            setCities(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchSubdistricts = async (cityId) => {
        if (!cityId) return
        try {
            const res = await axios.get(route('locations.subdistricts', cityId))
            setSubdistricts(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchVillages = async (subdistrictId) => {
        if (!subdistrictId) return
        try {
            const res = await axios.get(route('locations.villages', subdistrictId))
            setVillages(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    const handleLocationChange = (type, value) => {
        setForm(prev => {
            const newForm = { ...prev, [type]: value }
            
            // Reset child fields
            if (type === 'province_id') {
                newForm.city_id = ''
                newForm.subdistrict_id = ''
                newForm.village_id = ''
                setCities([])
                setSubdistricts([])
                setVillages([])
                fetchCities(value)
            } else if (type === 'city_id') {
                newForm.subdistrict_id = ''
                newForm.village_id = ''
                setSubdistricts([])
                setVillages([])
                fetchSubdistricts(value)
            } else if (type === 'subdistrict_id') {
                newForm.village_id = ''
                setVillages([])
                fetchVillages(value)
            }
            
            return newForm
        })
    }

    const handleItemChange = (index, field, value) => {
        const newItems = [...items]
        newItems[index][field] = value
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { product_name: '', color: '', size: '', quantity: 1, price: 0 }])
    }

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        // Ensure location fields are sent as strings if they are selected
        const payload = { ...form, items }

        router.post(route('sales.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false)
                setLoading(false)
                setForm({
                    card_number: '',
                    customer_name: '',
                    address: '',
                    province_id: '',
                    city_id: '',
                    subdistrict_id: '',
                    village_id: '',
                    price: 0,
                    payment_type: 'cash',
                    status: 'pending',
                    transaction_at: new Date().toISOString().split('T')[0],
                    is_tempo: 'no',
                    tempo_at: '',
                    note: '',
                    seller_id: auth.user.id,
                })
                setItems([{ product_name: '', color: '', size: '', quantity: 1, price: 0 }])
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
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Sales Baru</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Transaction Info */}
                        <div className="space-y-4 border p-4 rounded-lg">
                            <h3 className="font-semibold">Informasi Transaksi</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="transaction_at">Tanggal Transaksi</Label>
                                <Input
                                    id="transaction_at"
                                    name="transaction_at"
                                    type="date"
                                    value={form.transaction_at}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_type">Tipe Bayar</Label>
                                    <Select value={form.payment_type} onValueChange={v => handleChange({ target: { name: 'payment_type', value: v } })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="credit">Credit</SelectItem>
                                            <SelectItem value="tempo">Tempo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={form.status} onValueChange={v => handleChange({ target: { name: 'status', value: v } })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="partial">Partial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Total Harga (Otomatis)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={form.price}
                                    readOnly
                                    className="bg-muted font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Tempo?</Label>
                                    <Select value={form.is_tempo} onValueChange={v => handleChange({ target: { name: 'is_tempo', value: v } })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">Tidak</SelectItem>
                                            <SelectItem value="yes">Ya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {form.is_tempo === 'yes' && (
                                    <div className="space-y-2">
                                        <Label>Tgl Jatuh Tempo</Label>
                                        <Input
                                            type="date"
                                            name="tempo_at"
                                            value={form.tempo_at}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-4 border p-4 rounded-lg">
                            <h3 className="font-semibold">Data Pelanggan</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="card_number">No Kartu</Label>
                                <Input
                                    id="card_number"
                                    name="card_number"
                                    value={form.card_number}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer_name">Nama Pelanggan</Label>
                                <Input
                                    id="customer_name"
                                    name="customer_name"
                                    value={form.customer_name}
                                    onChange={handleChange}
                                    className={errors.customer_name ? "border-red-500" : ""}
                                />
                                {errors.customer_name && <p className="text-sm text-red-500">{errors.customer_name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Provinsi</Label>
                                    <Select value={String(form.province_id || '')} onValueChange={v => handleLocationChange('province_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map(p => (
                                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Kota/Kab</Label>
                                    <Select value={String(form.city_id || '')} onValueChange={v => handleLocationChange('city_id', v)} disabled={!form.province_id}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Kecamatan</Label>
                                    <Select value={String(form.subdistrict_id || '')} onValueChange={v => handleLocationChange('subdistrict_id', v)} disabled={!form.city_id}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subdistricts.map(s => (
                                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Desa/Kel</Label>
                                    <Select value={String(form.village_id || '')} onValueChange={v => handleLocationChange('village_id', v)} disabled={!form.subdistrict_id}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">-- Kosongkan --</SelectItem>
                                            {villages.map(v => (
                                                <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Items */}
                    <div className="border p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Daftar Produk</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Produk
                            </Button>
                        </div>
                        
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border-b pb-4 last:border-0 last:pb-0">
                                <div className="md:col-span-3 space-y-2">
                                    <Label>Nama Produk</Label>
                                    <Input 
                                        value={item.product_name} 
                                        onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                                        placeholder="Contoh: Kasur Busa"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Warna</Label>
                                    <Input 
                                        value={item.color} 
                                        onChange={e => handleItemChange(index, 'color', e.target.value)}
                                        placeholder="Biru"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Ukuran</Label>
                                    <Input 
                                        value={item.size} 
                                        onChange={e => handleItemChange(index, 'size', e.target.value)}
                                        placeholder="160x200"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Harga Satuan</Label>
                                    <Input 
                                        type="number"
                                        min="0"
                                        value={item.price} 
                                        onChange={e => handleItemChange(index, 'price', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Qty</Label>
                                    <Input 
                                        type="number"
                                        min="1"
                                        value={item.quantity} 
                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    {items.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Data"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
