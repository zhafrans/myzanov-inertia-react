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

export default function ChangeToCashTempoModal({
    open,
    setOpen,
    salesId,
    currentPrice,
    collectors,
}) {
    const [form, setForm] = useState({
        new_price: "",
        collector_id: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form saat modal dibuka
    useEffect(() => {
        if (open) {
            setForm({
                new_price: currentPrice.toString(),
                collector_id: collectors?.[0]?.id?.toString() || "",
            });
            setErrors({});
        }
    }, [open, currentPrice, collectors]);

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

        if (
            !form.new_price ||
            parseFloat(form.new_price) <= 0
        ) {
            newErrors.new_price = "Nominal harus lebih dari 0";
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
            route("sales.change-to-cash-tempo", salesId),
            {
                ...form,
                new_price: parseFloat(form.new_price),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setLoading(false);

                    // Tampilkan toast sukses
                    toast.success("Berhasil mengubah ke Cash Tempo!");

                    // Reload halaman untuk update data
                    router.reload({ only: ["sale"] });
                },
                onError: (errors) => {
                    setErrors(errors);
                    setLoading(false);

                    // Tampilkan toast error
                    toast.error(
                        "Gagal mengubah ke Cash Tempo. Silakan coba lagi."
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
                        Change to Cash Tempo
                    </DialogTitle>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Harga saat ini:{" "}
                            <span className="font-semibold">
                                {formatCurrency(currentPrice)}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Ubah tipe pembayaran dari Credit ke Cash Tempo
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
                            // step="1000"
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

                    {/* Tanggal Jatuh Tempo (Auto Set Now) */}
                    <div className="space-y-2">
                        <Label>Tanggal Jatuh Tempo</Label>
                        <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                            {new Date().toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "2-digit", 
                                year: "numeric",
                            })} (Auto set)
                        </div>
                    </div>

                    {/* Collector */}
                    <div className="space-y-2">
                        <Label htmlFor="collector_id">Penagih</Label>
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
                            className="sm:flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                loading ||
                                !form.new_price ||
                                !form.collector_id
                            }
                            className="sm:flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                "Ubah ke Cash Tempo"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
