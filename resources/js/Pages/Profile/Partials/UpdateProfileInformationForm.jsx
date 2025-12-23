import { useForm, usePage, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Camera } from 'lucide-react';

export default function UpdateProfileInformation({ className = '' }) {
    const user = usePage().props.auth.user;
    const profileImageUrl = usePage().props.profileImageUrl || null;
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            address: user.address || '',
            phone: user.phone || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile berhasil diperbarui');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat memperbarui profile');
            },
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload image immediately
            uploadImage(file);
        }
    };

    const uploadImage = (file) => {
        setUploadingImage(true);
        
        const formData = new FormData();
        formData.append('profile_image', file);

        router.post(route('profile.image.update'), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Foto profil berhasil diperbarui');
                setPreviewImage(null);
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat memperbarui foto profil');
                setPreviewImage(null);
            },
            onFinish: () => {
                setUploadingImage(false);
            },
        });
    };

    const getImageUrl = () => {
        if (previewImage) return previewImage;
        if (profileImageUrl) return profileImageUrl;
        return null;
    };

    const currentImageUrl = getImageUrl();

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                    Perbarui informasi profil dan alamat email Anda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-6">
                    {/* Profile Image */}
                    <div className="space-y-2">
                        <Label>Foto Profil</Label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar 
                                    className="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={handleAvatarClick}
                                >
                                    {currentImageUrl && (
                                        <AvatarImage
                                            src={currentImageUrl}
                                            alt={user.name}
                                        />
                                    )}
                                    <AvatarFallback className="text-2xl">
                                        {user.name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Klik avatar untuk mengubah foto profil
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Format: JPG, PNG, GIF, WEBP (Max: 2MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="0812-3456-7890"
                            autoComplete="tel"
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Masukkan alamat lengkap"
                            rows={3}
                        />
                        {errors.address && (
                            <p className="text-sm text-destructive">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        {recentlySuccessful && (
                            <p className="text-sm text-muted-foreground">
                                Tersimpan.
                            </p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}