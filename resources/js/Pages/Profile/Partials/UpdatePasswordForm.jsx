import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Password berhasil diperbarui');
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
                
                // Show specific error messages
                if (errors.current_password) {
                    toast.error(errors.current_password);
                } else if (errors.password) {
                    toast.error(errors.password[0] || 'Terjadi kesalahan saat memperbarui password');
                } else {
                    toast.error('Terjadi kesalahan saat memperbarui password');
                }
            },
        });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>
                    Pastikan akun Anda menggunakan password yang panjang dan acak untuk tetap aman.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={updatePassword} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Password Saat Ini</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type="password"
                            autoComplete="current-password"
                        />
                        {errors.current_password && (
                            <p className="text-sm text-destructive">
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password Baru
                        </Label>
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type="password"
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-destructive">
                                {errors.password_confirmation}
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