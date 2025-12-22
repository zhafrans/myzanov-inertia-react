import { Head } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import logo from "../Public/Images/myzanovweb.png"

export default function AuthLayout({ children, title = "Login" }) {
    return (
        <>
            <Head title={title} />

            <div className="min-h-screen flex items-center justify-center bg-muted">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">
                           <div className="h-14 flex items-center justify-center px-4 font-bold overflow-hidden">
                                <img
                                    src={logo}
                                    alt="MyZANOV"
                                    className="h-10 w-auto"
                                />
                            </div>
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
