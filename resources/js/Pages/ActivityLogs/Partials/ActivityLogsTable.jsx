import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { router } from "@inertiajs/react"

const actionVariant = action => {
    switch (action?.toUpperCase()) {
        case "CREATE":
            return "default"
        case "UPDATE":
            return "secondary"
        case "DELETE":
            return "destructive"
        case "READ":
            return "outline"
        default:
            return "outline"
    }
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function ActivityLogsTable({ logs, loading }) {
    const handlePageClick = (url) => {
        if (url) {
            router.get(url)
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative border rounded-lg overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {logs.data.length > 0 ? (
                            logs.data.map(log => (
                                <TableRow key={log.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        {log.user ? log.user.name : 'System'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={actionVariant(log.action)}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {log.module && (
                                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                                                {log.module}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div className="space-y-1">
                                            <p className="text-sm">{log.description}</p>
                                            {log.old_values && log.new_values && Object.keys(log.new_values).length > 0 && (
                                                <details className="text-xs text-muted-foreground">
                                                    <summary className="cursor-pointer hover:text-foreground">
                                                        View Changes
                                                    </summary>
                                                    <div className="mt-2 space-y-2 p-2 bg-muted rounded">
                                                        {Object.keys(log.new_values).map(key => (
                                                            <div key={key} className="flex items-start gap-2">
                                                                <span className="font-medium min-w-24">{key}:</span>
                                                                <div className="flex-1">
                                                                    <div className="line-through text-red-500">
                                                                        {log.old_values[key] ? JSON.stringify(log.old_values[key]) : '(empty)'}
                                                                    </div>
                                                                    <div className="text-green-600">
                                                                        → {JSON.stringify(log.new_values[key])}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {log.ip_address}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(log.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No activity logs found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {logs.data.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {logs.from} to {logs.to} of {logs.total} entries
                    </div>
                    <div className="flex gap-2">
                        {logs.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => handlePageClick(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}