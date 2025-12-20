import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { router } from "@inertiajs/react";
import axios from "axios";

export default function EditSalesModal({ open, setOpen, saleId, saleData }) {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Location Data
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Initialize form dengan data dari props
    useEffect(() => {
        if (open && saleData) {
            // Calculate installment_months from tempo_at if available
            let installmentMonths = 5; // default
            if (saleData.tempo_at && saleData.transaction_at) {
                const transactionDate = new Date(saleData.transaction_at);
                const tempoDate = new Date(saleData.tempo_at);
                const monthsDiff =
                    (tempoDate.getFullYear() - transactionDate.getFullYear()) *
                        12 +
                    (tempoDate.getMonth() - transactionDate.getMonth());
                if (monthsDiff > 0 && monthsDiff <= 36) {
                    installmentMonths = monthsDiff;
                }
            }

            setForm({
                card_number: saleData.card_number || "",
                customer_name: saleData.customer_name || "",
                address: saleData.address || "",
                phone: saleData.phone || "",
                price: saleData.price || 0,
                payment_type: saleData.payment_type || "cash",
                status: saleData.status || "paid",
                // Fix transaction_at format if needed
                transaction_at: saleData.transaction_at
                    ? saleData.transaction_at.split("T")[0].split(" ")[0]
                    : new Date().toISOString().split("T")[0],
                is_tempo: saleData.is_tempo
                    ? saleData.is_tempo === true ||
                      saleData.is_tempo === 1 ||
                      saleData.is_tempo === "yes"
                        ? "yes"
                        : "no"
                    : "no",
                tempo_at: saleData.tempo_at
                    ? saleData.tempo_at.split("T")[0]
                    : "",
                note: saleData.note || "",
                seller_id: saleData.seller_id || "",

                province_id: saleData.province_id || "",
                city_id: saleData.city_id || "",
                subdistrict_id: saleData.subdistrict_id || "",
                village_id: saleData.village_id || "",

                // New fields
                has_dp: saleData.has_dp || false,
                dp_amount: saleData.dp_amount || 0,
                installment_months: installmentMonths,
                cash_installment_amount:
                    saleData.cash_installment_amount || saleData.price || 0,
            });
            setErrors({});

            // Initial fetch of location data
            fetchProvinces();
            if (saleData.province_id) fetchCities(saleData.province_id);
            if (saleData.city_id) fetchSubdistricts(saleData.city_id);
            if (saleData.subdistrict_id) fetchVillages(saleData.subdistrict_id);
        }
    }, [open, saleData]);

    // Handle payment type change - auto calculate status and tempo
    useEffect(() => {
        if (
            !form.payment_type ||
            !form.transaction_at ||
            Object.keys(form).length === 0
        )
            return;

        const today = new Date(form.transaction_at);

        if (form.payment_type === "cash") {
            // Cash: status paid, no tempo, no DP, installment amount = total price
            setForm((prev) => {
                // Skip update if values already match
                if (
                    prev.status === "paid" &&
                    prev.is_tempo === "no" &&
                    !prev.has_dp
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    status: "paid",
                    is_tempo: "no",
                    tempo_at: "",
                    has_dp: false,
                    dp_amount: 0,
                    cash_installment_amount: prev.price,
                };
            });
        } else if (form.payment_type === "credit") {
            // Credit: status unpaid, calculate tempo date based on months
            const tempoDate = new Date(today);
            tempoDate.setMonth(
                tempoDate.getMonth() + (form.installment_months || 5)
            );
            const newTempoAt = tempoDate.toISOString().split("T")[0];

            setForm((prev) => {
                // Skip update if values already match
                if (
                    prev.status === "unpaid" &&
                    prev.is_tempo === "yes" &&
                    prev.tempo_at === newTempoAt
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    status: "unpaid",
                    is_tempo: "yes",
                    tempo_at: newTempoAt,
                };
            });
        } else if (form.payment_type === "cash_tempo") {
            // Cash Tempo: status unpaid, tempo +1 month
            const tempoDate = new Date(today);
            tempoDate.setMonth(tempoDate.getMonth() + 1);
            const newTempoAt = tempoDate.toISOString().split("T")[0];

            setForm((prev) => {
                // Skip update if values already match
                if (
                    prev.status === "unpaid" &&
                    prev.is_tempo === "yes" &&
                    prev.tempo_at === newTempoAt
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    status: "unpaid",
                    is_tempo: "yes",
                    tempo_at: newTempoAt,
                };
            });
        }
    }, [form.payment_type, form.installment_months, form.transaction_at]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get(route("locations.provinces"));
            setProvinces(res.data);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
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

            return newForm;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare payload - remove fields that are not in the sales table
        const payload = {
            card_number: form.card_number || null,
            customer_name: form.customer_name,
            address: form.address,
            phone: form.phone || null,
            price: Number(form.price) || 0,
            payment_type: form.payment_type,
            status: form.status,
            transaction_at: form.transaction_at,
            is_tempo: form.is_tempo || "no",
            tempo_at: form.tempo_at || null,
            note: form.note || null,
            seller_id: form.seller_id ? Number(form.seller_id) : null,
            province_id: form.province_id || null,
            city_id: form.city_id || null,
            subdistrict_id: form.subdistrict_id || null,
            village_id: form.village_id || null,
        };

        router.put(route("sales.update", saleId), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setLoading(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                            value={form.card_number || ""}
                            onChange={handleChange}
                            className={
                                errors.card_number ? "border-red-500" : ""
                            }
                        />
                        {errors.card_number && (
                            <p className="text-sm text-red-500">
                                {errors.card_number}
                            </p>
                        )}
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Nama Customer</Label>
                        <Input
                            id="customer_name"
                            name="customer_name"
                            value={form.customer_name || ""}
                            onChange={handleChange}
                            className={
                                errors.customer_name ? "border-red-500" : ""
                            }
                        />
                        {errors.customer_name && (
                            <p className="text-sm text-red-500">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>

                    {/* Location fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Provinsi</Label>
                            <SearchableSelect
                                value={form.province_id}
                                onValueChange={(v) =>
                                    handleLocationChange("province_id", v)
                                }
                                options={provinces}
                                placeholder="Pilih provinsi..."
                                searchPlaceholder="Cari provinsi..."
                                emptyText="Provinsi tidak ditemukan"
                            />
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
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label>Kecamatan</Label>
                            <SearchableSelect
                                value={form.subdistrict_id}
                                onValueChange={(v) =>
                                    handleLocationChange("subdistrict_id", v)
                                }
                                options={subdistricts}
                                placeholder="Pilih kecamatan..."
                                searchPlaceholder="Cari kecamatan..."
                                emptyText="Kecamatan tidak ditemukan"
                                disabled={!form.city_id}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Desa/Kel</Label>
                            <SearchableSelect
                                value={form.village_id}
                                onValueChange={(v) =>
                                    handleLocationChange("village_id", v)
                                }
                                options={villages}
                                placeholder="Pilih desa/kelurahan..."
                                searchPlaceholder="Cari desa/kelurahan..."
                                emptyText="Desa/Kelurahan tidak ditemukan"
                                disabled={!form.subdistrict_id}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Textarea
                            id="address"
                            name="address"
                            value={form.address || ""}
                            onChange={handleChange}
                            rows={3}
                            className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Total Harga</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            value={form.price || ""}
                            onChange={handleChange}
                            className={errors.price ? "border-red-500" : ""}
                        />
                        {errors.price && (
                            <p className="text-sm text-red-500">
                                {errors.price}
                            </p>
                        )}
                    </div>

                    {/* Grid untuk Payment Type, Status, Transaction Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment_type">
                                Tipe Pembayaran
                            </Label>
                            <Select
                                value={form.payment_type}
                                onValueChange={(value) =>
                                    handleSelectChange("payment_type", value)
                                }
                            >
                                <SelectTrigger
                                    className={
                                        errors.payment_type
                                            ? "border-red-500"
                                            : ""
                                    }
                                >
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
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
                        <Label htmlFor="transaction_at">
                            Tanggal Transaksi
                        </Label>
                        <Input
                            id="transaction_at"
                            name="transaction_at"
                            type="date"
                            value={form.transaction_at || ""}
                            onChange={handleChange}
                            className={
                                errors.transaction_at ? "border-red-500" : ""
                            }
                            required
                        />
                        {errors.transaction_at && (
                            <p className="text-sm text-red-500">
                                {errors.transaction_at}
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
                                Installment otomatis sebesar:
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-green-700">
                                    Jumlah:
                                </span>
                                <span className="font-bold text-green-800">
                                    Rp {form.price.toLocaleString("id-ID")}
                                </span>
                            </div>
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
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    installment_months: months,
                                                }))
                                            }
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
                                    className="mt-2"
                                />
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
                                                : 0,
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
                                        value={form.dp_amount}
                                        onChange={handleChange}
                                        placeholder="Masukkan nominal DP"
                                        required={form.has_dp}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Sisa: Rp{" "}
                                        {(
                                            form.price - (form.dp_amount || 0)
                                        ).toLocaleString("id-ID")}
                                    </p>
                                    {form.dp_amount > form.price && (
                                        <p className="text-xs text-red-500">
                                            DP tidak boleh melebihi total harga
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
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                {form.payment_type === "cash_tempo"
                                    ? "Tempo 1 bulan dari tanggal transaksi"
                                    : `Tempo ${
                                          form.installment_months || 5
                                      } bulan dari tanggal transaksi`}
                            </p>
                        </div>
                    )}

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Catatan</Label>
                        <Textarea
                            id="note"
                            name="note"
                            value={form.note || ""}
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
    );
}
