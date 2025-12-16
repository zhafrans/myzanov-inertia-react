import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const dummyUser = {
    username: "umi",
    role: "sales",
    createdAt: "2024-01-10",
}

export default function UserInfoCard() {
    return (
        <Card>
            <CardContent className="flex items-center gap-6 py-6">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                        U
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h2 className="text-xl font-bold">
                        {dummyUser.username}
                    </h2>
                    <p className="capitalize text-muted-foreground">
                        Hak Akses: {dummyUser.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Bergabung: {dummyUser.createdAt}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
