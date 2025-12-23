import AppLayout from '@/Layouts/AppLayout';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Pengaturan Profil</h1>
                <p className="text-muted-foreground">
                    Kelola informasi profil dan kata sandi Anda
                </p>
            </div>

            <UpdateProfileInformationForm />
            <UpdatePasswordForm />
        </div>
    );
}

// Layout wrapper
Edit.layout = page => (
    <AppLayout title="Pengaturan Profil">
        {page}
    </AppLayout>
)