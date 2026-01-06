import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function ChangeToCreditModal({
    open,
    setOpen,
    salesId,
    currentPrice,
    collectors,
}) {
    const [form, setForm] = useState({
        new_price: "",
        installment_months: "5",
        first_installment_amount: "",
        collector_id: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form saat modal dibuka
    useEffect(() => {
        if (open) {
            setForm({
                new_price: currentPrice.toString(),
                installment_months: "5",
                first_installment_amount: currentPrice.toString(),
                collector_id: collectors?.[0]?.id?.toString() || "",
            });
            setErrors({});
        }
    }, [open, currentPrice, collectors]);

    // Auto-calculate tempo date based on installment months
    useEffect(() => {
        if (form.installment_months && form.installment_months > 0) {
            const today = new Date();
            const tempoDate = new Date(today);
            tempoDate.setMonth(tempoDate.getMonth() + parseInt(form.installment_months));
            
            setForm(prev => ({
                ...prev,
                tempo_at: tempoDate.toISOString().split("T")[0]
            }));
        }
    }, [form.installment_months]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error saat user mulai mengetik
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

    const handleCollectorChange = (value) => {
        handleSelectChange("collector_id", value);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.new_price || parseFloat(form.new_price) <= 0) {
            newErrors.new_price = "Nominal harus lebih dari 0";
        }

        if (!form.installment_months || parseInt(form.installment_months) <= 0) {
            newErrors.installment_months = "Jumlah bulan harus lebih dari 0";
        }

        if (!form.first_installment_amount || parseFloat(form.first_installment_amount) <= 0) {
            newErrors.first_installment_amount = "Jumlah installment pertama harus lebih dari 0";
        }

        if (parseFloat(form.first_installment_amount) > parseFloat(form.new_price)) {
            newErrors.first_installment_amount = "Jumlah installment pertama tidak boleh melebihi total harga";
        }

        if (!form.collector_id) {
            newErrors.collector_id = "Collector harus dipilih";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        router.post(
            route("sales.change-to-credit", salesId),
            {
                ...form,
                new_price: parseFloat(form.new_price),
                installment_months: parseInt(form.installment_months),
                first_installment_amount: parseFloat(form.first_installment_amount),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setLoading(false);

                    // Tampilkan toast sukses
                    toast.success("Berhasil mengubah ke Credit!");

                    // Reload halaman untuk update data
                    router.reload({ only: ["sale"] });
                },
                onError: (errors) => {
                    setErrors(errors);
                    setLoading(false);

                    // Tampilkan toast error
                    toast.error(
                        "Gagal mengubah ke Credit. Silakan coba lagi."
                    );
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Change to Credit
                    </DialogTitle>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Harga saat ini:{" "}
                            <span className="font-semibold">
                                {formatCurrency(currentPrice)}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Ubah tipe pembayaran dari Cash Tempo ke Credit
                        </p>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Ganti Nominal Harga */}
                    <div className="space-y-2">
                        <Label htmlFor="new_price">
                            Ganti Nominal Harga
                        </Label>
                        <Input
                            id="new_price"
                            name="new_price"
                            type="number"
                            value={form.new_price}
                            onChange={handleChange}
                            placeholder="Masukkan nominal harga baru"
                            className={
                                errors.new_price
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                            }
                            min="0"
                        />
                        {errors.new_price && (
                            <p className="text-sm text-red-500">
                                {errors.new_price}
                            </p>
                        )}
                        <div className="flex justify-end">
                            <span className="text-xs text-muted-foreground">
                                Terbilang:{" "}
                                {formatCurrency(form.new_price)}
                            </span>
                        </div>
                    </div>

                    {/* Jumlah Bulan Angsuran */}
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
                                        form.installment_months === months.toString()
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => {
                                        setForm((prev) => ({
                                            ...prev,
                                            installment_months: months.toString(),
                                        }));
                                        if (errors.installment_months)
                                            setErrors((prev) => ({
                                                ...prev,
                                                installment_months: undefined,
                                            }));
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
                                new Date(form.tempo_at).toLocaleDateString(
                                    "id-ID"
                                )}
                        </p>
                    </div>

                    {/* Installment Pertama */}
                    <div className="space-y-2">
                        <Label htmlFor="first_installment_amount">
                            Jumlah Tagihan Pertama
                        </Label>
                        <Input
                            id="first_installment_amount"
                            name="first_installment_amount"
                            type="number"
                            value={form.first_installment_amount}
                            onChange={handleChange}
                            placeholder="Masukkan jumlah installment pertama"
                            className={
                                errors.first_installment_amount
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                            }
                            min="0"
                            max={form.new_price}
                        />
                        {errors.first_installment_amount && (
                            <p className="text-sm text-red-500">
                                {errors.first_installment_amount}
                            </p>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Sisa: {formatCurrency(parseFloat(form.new_price || 0) - parseFloat(form.first_installment_amount || 0))}</span>
                            <span>
                                {parseFloat(form.first_installment_amount || 0) > parseFloat(form.new_price || 0) &&
                                    "DP tidak boleh melebihi total harga"
                                }
                            </span>
                        </div>
                    </div>

                    {/* Collector */}
                    <div className="space-y-2">
                        <Label htmlFor="collector_id">Penagih Pertama</Label>
                        <SearchableSelect
                            value={form.collector_id}
                            onValueChange={handleCollectorChange}
                            options={collectors || []}
                            placeholder="Pilih penagih..."
                            searchPlaceholder="Cari penagih..."
                            emptyText="Tidak ada collector tersedia"
                            disabled={!collectors || collectors.length === 0}
                            className={
                                errors.collector_id ? "border-red-500" : ""
                            }
                        />
                        {errors.collector_id && (
                            <p className="text-sm text-red-500">
                                {errors.collector_id}
                            </p>
                        )}
                        {collectors && collectors.length === 0 && (
                            <p className="text-sm text-amber-600">
                                Tidak ada collector tersedia. Tambahkan
                                collector terlebih dahulu.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Ubah ke Credit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
