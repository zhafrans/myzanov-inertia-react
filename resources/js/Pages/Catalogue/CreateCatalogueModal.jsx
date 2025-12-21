import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function CreateCatalogueModal({ open, setOpen }) {
    const [previewImage, setPreviewImage] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        category: "",
        gender: "",
        material: "",
        cash_price: "",
        credit_price: "",
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("products.store"), {
            onSuccess: () => {
                reset();
                setPreviewImage(null);
                setOpen(false);
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleClose = () => {
        reset();
        setPreviewImage(null);
        setOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Produk Baru</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 col-span-2">
                            <Label>Nama Produk *</Label>
                            <Input
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Masukkan nama produk"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Kategori</Label>
                            <Input
                                name="category"
                                value={data.category}
                                onChange={(e) =>
                                    setData("category", e.target.value)
                                }
                                placeholder="Masukkan kategori"
                            />
                            {errors.category && (
                                <p className="text-sm text-destructive">
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Gender</Label>
                            <Input
                                name="gender"
                                value={data.gender}
                                onChange={(e) =>
                                    setData("gender", e.target.value)
                                }
                                placeholder="Pria / Wanita"
                            />
                            {errors.gender && (
                                <p className="text-sm text-destructive">
                                    {errors.gender}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1 col-span-2">
                            <Label>Bahan</Label>
                            <Input
                                name="material"
                                value={data.material}
                                onChange={(e) =>
                                    setData("material", e.target.value)
                                }
                                placeholder="Masukkan bahan"
                            />
                            {errors.material && (
                                <p className="text-sm text-destructive">
                                    {errors.material}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Harga Cash</Label>
                            <Input
                                type="number"
                                name="cash_price"
                                value={data.cash_price}
                                onChange={(e) =>
                                    setData("cash_price", e.target.value)
                                }
                                placeholder="0"
                            />
                            {errors.cash_price && (
                                <p className="text-sm text-destructive">
                                    {errors.cash_price}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Harga Kredit</Label>
                            <Input
                                type="number"
                                name="credit_price"
                                value={data.credit_price}
                                onChange={(e) =>
                                    setData("credit_price", e.target.value)
                                }
                                placeholder="0"
                            />
                            {errors.credit_price && (
                                <p className="text-sm text-destructive">
                                    {errors.credit_price}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1 col-span-2">
                            <Label>Gambar Produk</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {errors.image && (
                                <p className="text-sm text-destructive">
                                    {errors.image}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Format: JPG, PNG, GIF, WEBP (Max: 2MB)
                            </p>
                        </div>

                        {previewImage && (
                            <div className="col-span-2">
                                <Label>Preview Gambar</Label>
                                <div className="mt-2">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded border"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
