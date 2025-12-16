import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function UserProfileCard() {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <Avatar className="h-14 w-14">
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>

                <div>
                    <h2 className="text-lg font-semibold">umi</h2>
                    <p className="text-sm text-muted-foreground">
                        Sales • Created at 2024-01-01
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
