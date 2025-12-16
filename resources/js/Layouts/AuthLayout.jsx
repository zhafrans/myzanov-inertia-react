import { Head } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthLayout({ children, title = "Login" }) {
    return (
        <>
            <Head title={title} />

            <div className="min-h-screen flex items-center justify-center bg-muted">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Sales Monitor
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {children}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
