import AuthLayout from "@/Layouts/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "@inertiajs/react"

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    })

    const submit = (e) => {
        e.preventDefault()
        post(route("login"))
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Input
                placeholder="Email"
                value={data.email}
                onChange={e => setData("email", e.target.value)}
            />
            {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
            )}

            <Input
                type="password"
                placeholder="Password"
                value={data.password}
                onChange={e => setData("password", e.target.value)}
            />

            <div className="flex items-center gap-2">
                <Checkbox
                    checked={data.remember}
                    onCheckedChange={v => setData("remember", v)}
                />
                <span className="text-sm">Ingat saya</span>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={processing}
            >
                {processing ? "Login..." : "Login"}
            </Button>
        </form>
    )
}

Login.layout = page => (
    <AuthLayout title="Login">
        {page}
    </AuthLayout>
)
