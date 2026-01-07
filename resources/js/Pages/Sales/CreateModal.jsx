import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function CreateModal() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Location Data
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Users/Sellers Data
    const [users, setUsers] = useState([]);

    const [items, setItems] = useState([
        { product_name: "", color: "", size: "", quantity: 1, price: null },
    ]);

    const [form, setForm] = useState({
        card_number: "",
        customer_name: "",
        phone: "",
        address: "",
        province_id: "",
        city_id: "",
        subdistrict_id: "",
        village_id: "",
        price: 0,
        payment_type: "cash",
        status: "paid", // default for cash
        transaction_at: new Date().toISOString().split("T")[0],
        is_tempo: "no",
        tempo_at: "",
        note: "",
        seller_id: auth.user.id,
        has_dp: false,
        dp_amount: null,
        installment_months: 5, // default for credit
        // Field untuk installment cash
        cash_installment_amount: 0,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            // Reset province_id saat modal dibuka
            setForm((prev) => ({ ...prev, province_id: "" }));
            setCities([]);
            setSubdistricts([]);
            setVillages([]);
            fetchProvinces();
            fetchUsers();
            setErrors({});
        }
    }, [open]);

    // Auto-calculate total price dan set cash installment amount
    useEffect(() => {
        const total = items.reduce(
            (sum, item) =>
                sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
            0
        );
        setForm((prev) => ({
            ...prev,
            price: total,
            // Untuk cash, installment amount sama dengan total harga
            cash_installment_amount:
                form.payment_type === "cash"
                    ? total
                    : prev.cash_installment_amount,
        }));
    }, [items, form.payment_type]);

    // Handle payment type change
    useEffect(() => {
        const today = new Date(form.transaction_at);

        if (form.payment_type === "cash") {
            // Cash: status paid, no tempo, no DP, installment amount = total price
            setForm((prev) => ({
                ...prev,
                status: "paid",
                is_tempo: "no",
                tempo_at: "",
                has_dp: false,
                dp_amount: 0,
                cash_installment_amount: prev.price,
            }));
        } else if (form.payment_type === "credit") {
            // Credit: status pending, calculate tempo date based on months
            const tempoDate = new Date(today);
            tempoDate.setMonth(tempoDate.getMonth() + form.installment_months);

            setForm((prev) => ({
                ...prev,
                status: "unpaid",
                is_tempo: "yes",
                tempo_at: tempoDate.toISOString().split("T")[0],
            }));
        } else if (form.payment_type === "cash_tempo") {
            // Cash Tempo: status pending, tempo +1 month
            const tempoDate = new Date(today);
            tempoDate.setMonth(tempoDate.getMonth() + 1);

            setForm((prev) => ({
                ...prev,
                status: "unpaid",
                is_tempo: "yes",
                tempo_at: tempoDate.toISOString().split("T")[0],
            }));
        }
    }, [
        form.payment_type,
        form.installment_months,
        form.transaction_at,
        form.price,
    ]);

    // Update cash installment amount when price changes
    useEffect(() => {
        if (form.payment_type === "cash") {
            setForm((prev) => ({
                ...prev,
                cash_installment_amount: prev.price,
            }));
        }
    }, [form.price, form.payment_type]);

    // Update tempo date when transaction date changes
    useEffect(() => {
        if (
            form.transaction_at &&
            (form.payment_type === "credit" ||
                form.payment_type === "cash_tempo")
        ) {
            const today = new Date(form.transaction_at);
            const tempoDate = new Date(today);

            if (form.payment_type === "credit") {
                tempoDate.setMonth(
                    tempoDate.getMonth() + form.installment_months
                );
            } else if (form.payment_type === "cash_tempo") {
                tempoDate.setMonth(tempoDate.getMonth() + 1);
            }

            setForm((prev) => ({
                ...prev,
                tempo_at: tempoDate.toISOString().split("T")[0],
            }));
        }
    }, [form.transaction_at, form.payment_type, form.installment_months]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get(route("locations.provinces"));
            setProvinces(res.data);

            // Set default province to JAWA TENGAH
            const jawaTengah = res.data.find(
                (province) => province.name?.toUpperCase() === "JAWA TENGAH"
            );
            if (jawaTengah) {
                setForm((prev) => {
                    // Only set if province_id is empty
                    if (!prev.province_id) {
                        fetchCities(jawaTengah.id);
                        return { ...prev, province_id: jawaTengah.id };
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCities = async (provinceId) => {
        if (!provinceId) return;
        try {
            const res = await axios.get(route("locations.cities", provinceId));
            setCities(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubdistricts = async (cityId) => {
        if (!cityId) return;
        try {
            const res = await axios.get(
                route("locations.subdistricts", cityId)
            );
            setSubdistricts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchVillages = async (subdistrictId) => {
        if (!subdistrictId) return;
        try {
            const res = await axios.get(
                route("locations.villages", subdistrictId)
            );
            setVillages(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(route("api.users"));
            // Format users untuk SearchableSelect
            const formattedUsers = res.data.map(user => ({
                id: user.id.toString(),
                name: user.name,
            }));
            setUsers(formattedUsers);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle dp_amount: convert empty string to null
        const finalValue = name === "dp_amount" && value === "" ? null : value;
        setForm((prev) => ({ ...prev, [name]: finalValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleLocationChange = (type, value) => {
        setForm((prev) => {
            const newForm = { ...prev, [type]: value };

            // Reset child fields
            if (type === "province_id") {
                newForm.city_id = "";
                newForm.subdistrict_id = "";
                newForm.village_id = "";
                setCities([]);
                setSubdistricts([]);
                setVillages([]);
                fetchCities(value);
            } else if (type === "city_id") {
                newForm.subdistrict_id = "";
                newForm.village_id = "";
                setSubdistricts([]);
                setVillages([]);
                fetchSubdistricts(value);
            } else if (type === "subdistrict_id") {
                newForm.village_id = "";
                setVillages([]);
                fetchVillages(value);
            }

            // Clear errors for this field and child fields
            if (errors[type])
                setErrors((prev) => ({ ...prev, [type]: undefined }));
            if (type === "province_id") {
                if (errors.city_id)
                    setErrors((prev) => ({ ...prev, city_id: undefined }));
                if (errors.subdistrict_id)
                    setErrors((prev) => ({
                        ...prev,
                        subdistrict_id: undefined,
                    }));
                if (errors.village_id)
                    setErrors((prev) => ({ ...prev, village_id: undefined }));
            } else if (type === "city_id") {
                if (errors.subdistrict_id)
                    setErrors((prev) => ({
                        ...prev,
                        subdistrict_id: undefined,
                    }));
                if (errors.village_id)
                    setErrors((prev) => ({ ...prev, village_id: undefined }));
            } else if (type === "subdistrict_id") {
                if (errors.village_id)
                    setErrors((prev) => ({ ...prev, village_id: undefined }));
            }

            return newForm;
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);

        // Clear error for this item field
        const errorKey = `items.${index}.${field}`;
        if (errors[errorKey]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const addItem = () => {
        setItems([
            ...items,
            { product_name: "", color: "", size: "", quantity: 1, price: null },
        ]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare payload
        const payload = {
            ...form,
            items,
            // Untuk cash, kita akan mengirim installment otomatis
            // Installment akan dibuat di backend dengan jumlah cash_installment_amount
        };

        router.post(route("sales.store"), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setLoading(false);
                // Reset form to defaults
                resetForm();
                toast.success("Sales berhasil ditambahkan!");
            },
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
                toast.error(
                    "Gagal menambahkan sales. Silakan periksa kembali data yang diinput."
                );
            },
            onFinish: () => setLoading(false),
        });
    };

    const resetForm = () => {
        setForm({
            card_number: "",
            customer_name: "",
            phone: "",
            address: "",
            province_id: "",
            city_id: "",
            subdistrict_id: "",
            village_id: "",
            price: 0,
            payment_type: "cash",
            status: "paid",
            transaction_at: new Date().toISOString().split("T")[0],
            is_tempo: "no",
            tempo_at: "",
            note: "",
            seller_id: auth.user.id,
            has_dp: false,
            dp_amount: null,
            installment_months: 5,
            cash_installment_amount: 0,
        });
        setItems([
            { product_name: "", color: "", size: "", quantity: 1, price: null },
        ]);
        setErrors({});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="w-full md:w-auto text-xs md:text-sm"
                >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Tambah Data</span>
                    <span className="sm:hidden">Tambah</span>
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
                            <h3 className="font-semibold">
                                Informasi Transaksi
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="transaction_at">
                                    Tanggal Transaksi
                                </Label>
                                <Input
                                    id="transaction_at"
                                    name="transaction_at"
                                    type="date"
                                    value={form.transaction_at}
                                    onChange={handleChange}
                                    className={
                                        errors.transaction_at
                                            ? "border-red-500"
                                            : ""
                                    }
                                    required
                                />
                                {errors.transaction_at && (
                                    <p className="text-sm text-red-500">
                                        {errors.transaction_at}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_type">
                                        Tipe Bayar
                                    </Label>
                                    <Select
                                        value={form.payment_type}
                                        onValueChange={(v) => {
                                            setForm((prev) => ({
                                                ...prev,
                                                payment_type: v,
                                            }));
                                            if (errors.payment_type)
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    payment_type: undefined,
                                                }));
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.payment_type
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">
                                                Cash
                                            </SelectItem>
                                            <SelectItem value="credit">
                                                Credit
                                            </SelectItem>
                                            <SelectItem value="cash_tempo">
                                                Cash Tempo
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_type && (
                                        <p className="text-sm text-red-500">
                                            {errors.payment_type}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Input
                                        id="status"
                                        name="status"
                                        value={
                                            form.status === "paid"
                                                ? "Lunas"
                                                : "Belum Lunas"
                                        }
                                        readOnly
                                        className="bg-muted font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Total Harga (Otomatis)
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={form.price}
                                    readOnly
                                    className={`bg-muted font-bold ${
                                        errors.price ? "border-red-500" : ""
                                    }`}
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            {/* Informasi pembayaran cash */}
                            {form.payment_type === "cash" && form.price > 0 && (
                                <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm font-medium text-green-800">
                                        Pembayaran Cash
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Akan dibuat installment otomatis
                                        sebesar:
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-green-700">
                                            Jumlah:
                                        </span>
                                        <span className="font-bold text-green-800">
                                            Rp{" "}
                                            {form.price.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-600">
                                        Installment akan otomatis dicatat
                                        sebagai pembayaran lunas.
                                    </p>
                                </div>
                            )}

                            {/* Credit-specific fields */}
                            {form.payment_type === "credit" && (
                                <div className="space-y-3 border-t pt-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="installment_months">
                                            Jumlah Bulan Angsuran
                                        </Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {[1, 2, 3, 4, 5].map((months) => (
                                                <Button
                                                    key={months}
                                                    type="button"
                                                    variant={
                                                        form.installment_months ===
                                                        months
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() => {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            installment_months:
                                                                months,
                                                        }));
                                                        if (
                                                            errors.installment_months
                                                        )
                                                            setErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    installment_months:
                                                                        undefined,
                                                                })
                                                            );
                                                    }}
                                                >
                                                    {months} Bulan
                                                </Button>
                                            ))}
                                        </div>
                                        <Input
                                            id="installment_months"
                                            name="installment_months"
                                            type="number"
                                            min="1"
                                            max="36"
                                            value={form.installment_months}
                                            onChange={handleChange}
                                            className={`mt-2 ${
                                                errors.installment_months
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {errors.installment_months && (
                                            <p className="text-sm text-red-500">
                                                {errors.installment_months}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Jatuh Tempo:{" "}
                                            {form.tempo_at &&
                                                new Date(
                                                    form.tempo_at
                                                ).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* DP Section - Show for credit and cash_tempo */}
                            {(form.payment_type === "credit" ||
                                form.payment_type === "cash_tempo") && (
                                <div className="space-y-3 border-t pt-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_dp"
                                            checked={form.has_dp}
                                            onCheckedChange={(checked) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    has_dp: checked,
                                                    dp_amount: checked
                                                        ? prev.dp_amount
                                                        : null,
                                                }));
                                            }}
                                        />
                                        <Label
                                            htmlFor="has_dp"
                                            className="cursor-pointer"
                                        >
                                            Ada DP (Down Payment)
                                        </Label>
                                    </div>

                                    {form.has_dp && (
                                        <div className="space-y-2">
                                            <Label htmlFor="dp_amount">
                                                Nominal DP
                                            </Label>
                                            <Input
                                                id="dp_amount"
                                                name="dp_amount"
                                                type="number"
                                                min="0"
                                                max={form.price}
                                                value={form.dp_amount ?? ""}
                                                onChange={handleChange}
                                                placeholder="Input nominal DP"
                                                className={
                                                    errors.dp_amount
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                                required={form.has_dp}
                                            />
                                            {errors.dp_amount && (
                                                <p className="text-sm text-red-500">
                                                    {errors.dp_amount}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Sisa: Rp{" "}
                                                {(
                                                    form.price -
                                                    (form.dp_amount || 0)
                                                ).toLocaleString("id-ID")}
                                            </p>
                                            {form.dp_amount > form.price && (
                                                <p className="text-xs text-red-500">
                                                    DP tidak boleh melebihi
                                                    total harga
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tempo Date - Show for credit and cash_tempo */}
                            {(form.payment_type === "credit" ||
                                form.payment_type === "cash_tempo") && (
                                <div className="space-y-2">
                                    <Label>Jatuh Tempo</Label>
                                    <Input
                                        type="date"
                                        name="tempo_at"
                                        value={form.tempo_at}
                                        readOnly
                                        className={`bg-muted ${
                                            errors.tempo_at
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.tempo_at && (
                                        <p className="text-sm text-red-500">
                                            {errors.tempo_at}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {form.payment_type === "cash_tempo"
                                            ? "Tempo 1 bulan dari tanggal transaksi"
                                            : `Tempo ${form.installment_months} bulan dari tanggal transaksi`}
                                    </p>
                                </div>
                            )}
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
                                    placeholder="Input no kartu"
                                    className={
                                        errors.card_number
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.card_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.card_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer_name">
                                    Nama Pelanggan
                                </Label>
                                <Input
                                    id="customer_name"
                                    name="customer_name"
                                    value={form.customer_name}
                                    onChange={handleChange}
                                    className={
                                        errors.customer_name
                                            ? "border-red-500"
                                            : ""
                                    }
                                    required
                                />
                                {errors.customer_name && (
                                        <p className="text-sm text-red-500">
                                        {errors.customer_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    No. Telepon
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className={
                                        errors.phone
                                            ? "border-red-500"
                                            : ""
                                    }
                                    placeholder="Masukkan nomor telepon"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Provinsi</Label>
                                    <SearchableSelect
                                        value={form.province_id}
                                        onValueChange={(v) =>
                                            handleLocationChange(
                                                "province_id",
                                                v
                                            )
                                        }
                                        options={provinces}
                                        placeholder="Pilih provinsi..."
                                        searchPlaceholder="Cari provinsi..."
                                        emptyText="Provinsi tidak ditemukan"
                                        className={
                                            errors.province_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.province_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.province_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Kota/Kab</Label>
                                    <SearchableSelect
                                        value={form.city_id}
                                        onValueChange={(v) =>
                                            handleLocationChange("city_id", v)
                                        }
                                        options={cities}
                                        placeholder="Pilih kota/kabupaten..."
                                        searchPlaceholder="Cari kota/kabupaten..."
                                        emptyText="Kota/Kabupaten tidak ditemukan"
                                        disabled={!form.province_id}
                                        className={
                                            errors.city_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.city_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.city_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Kecamatan</Label>
                                    <SearchableSelect
                                        value={form.subdistrict_id}
                                        onValueChange={(v) =>
                                            handleLocationChange(
                                                "subdistrict_id",
                                                v
                                            )
                                        }
                                        options={subdistricts}
                                        placeholder="Pilih kecamatan..."
                                        searchPlaceholder="Cari kecamatan..."
                                        emptyText="Kecamatan tidak ditemukan"
                                        disabled={!form.city_id}
                                        className={
                                            errors.subdistrict_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.subdistrict_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.subdistrict_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Desa/Kel</Label>
                                    <SearchableSelect
                                        value={form.village_id}
                                        onValueChange={(v) =>
                                            handleLocationChange(
                                                "village_id",
                                                v
                                            )
                                        }
                                        options={villages}
                                        placeholder="Pilih desa/kelurahan..."
                                        searchPlaceholder="Cari desa/kelurahan..."
                                        emptyText="Desa/Kelurahan tidak ditemukan"
                                        disabled={!form.subdistrict_id}
                                        className={
                                            errors.village_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.village_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.village_id}
                                        </p>
                                    )}
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
                                    className={
                                        errors.address ? "border-red-500" : ""
                                    }
                                    required
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seller_id">Nama Sales</Label>
                                <SearchableSelect
                                    value={form.seller_id?.toString() || ""}
                                    onValueChange={(v) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            seller_id: v ? Number(v) : null,
                                        }));
                                        if (errors.seller_id)
                                            setErrors((prev) => ({
                                                ...prev,
                                                seller_id: undefined,
                                            }));
                                    }}
                                    options={users}
                                    placeholder="Pilih nama sales..."
                                    searchPlaceholder="Cari nama sales..."
                                    emptyText="Sales tidak ditemukan"
                                    className={
                                        errors.seller_id ? "border-red-500" : ""
                                    }
                                />
                                {errors.seller_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.seller_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Items */}
                    <div className="border p-4 rounded-lg space-y-4">
                        {/* <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Daftar Produk</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Produk
                            </Button>
                        </div> */}

                        {errors.items && (
                            <p className="text-sm text-red-500">
                                {errors.items}
                            </p>
                        )}

                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border-b pb-4 last:border-0 last:pb-0"
                            >
                                <div className="md:col-span-3 space-y-2">
                                    <Label>Nama Produk</Label>
                                    <Input
                                        value={item.product_name}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "product_name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Input nama produk"
                                        className={
                                            errors[
                                                `items.${index}.product_name`
                                            ]
                                                ? "border-red-500"
                                                : ""
                                        }
                                        required
                                    />
                                    {errors[`items.${index}.product_name`] && (
                                        <p className="text-sm text-red-500">
                                            {
                                                errors[
                                                    `items.${index}.product_name`
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Warna</Label>
                                    <Input
                                        value={item.color}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "color",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Input warna"
                                        className={
                                            errors[`items.${index}.color`]
                                                ? "border-red-500"
                                                : ""
                                        }
                                        required
                                    />
                                    {errors[`items.${index}.color`] && (
                                        <p className="text-sm text-red-500">
                                            {errors[`items.${index}.color`]}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Ukuran</Label>
                                    <Input
                                        value={item.size}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "size",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Input ukuran"
                                        className={
                                            errors[`items.${index}.size`]
                                                ? "border-red-500"
                                                : ""
                                        }
                                        required
                                    />
                                    {errors[`items.${index}.size`] && (
                                        <p className="text-sm text-red-500">
                                            {errors[`items.${index}.size`]}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Harga Satuan</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={item.price ?? ""}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "price",
                                                e.target.value === ""
                                                    ? null
                                                    : e.target.value
                                            )
                                        }
                                        className={
                                            errors[`items.${index}.price`]
                                                ? "border-red-500"
                                                : ""
                                        }
                                        required
                                    />
                                    {errors[`items.${index}.price`] && (
                                        <p className="text-sm text-red-500">
                                            {errors[`items.${index}.price`]}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Qty</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "quantity",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            errors[`items.${index}.quantity`]
                                                ? "border-red-500"
                                                : ""
                                        }
                                        required
                                    />
                                    {errors[`items.${index}.quantity`] && (
                                        <p className="text-sm text-red-500">
                                            {errors[`items.${index}.quantity`]}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-1">
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
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
                            {loading ? "Menyimpan..." : "Simpan Data"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
