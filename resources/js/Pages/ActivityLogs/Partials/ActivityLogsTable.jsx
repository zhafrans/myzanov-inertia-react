import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const dummyLogs = [
    {
        id: 1,
        user: "admin",
        action: "CREATE",
        description: "Menambahkan user baru (umi)",
        date: "2024-12-16 10:12",
    },
    {
        id: 2,
        user: "umi",
        action: "UPDATE",
        description: "Mengubah data sales",
        date: "2024-12-16 11:03",
    },
    {
        id: 3,
        user: "admin",
        action: "DELETE",
        description: "Menghapus user bihan",
        date: "2024-12-16 11:20",
    },
]

const actionVariant = action => {
    switch (action) {
        case "CREATE":
            return "default"
        case "UPDATE":
            return "secondary"
        case "DELETE":
            return "destructive"
        default:
            return "outline"
    }
}

export default function ActivityLogsTable() {
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Tanggal</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {dummyLogs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>
                                <Badge variant={actionVariant(log.action)}>
                                    {log.action}
                                </Badge>
                            </TableCell>
                            <TableCell>{log.description}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {log.date}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
