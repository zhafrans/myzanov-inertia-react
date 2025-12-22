import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function UserInfoCard({ user }) {
    if (!user) return null;

    const initials = user.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    return (
        <Card>
            <CardContent className="flex items-center gap-6 py-6">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h2 className="text-xl font-bold">
                        {user.name}
                    </h2>
                    <p className="capitalize text-muted-foreground">
                        Hak Akses: {user.role}
                    </p>
                    </div>
            </CardContent>
        </Card>
    )
}
