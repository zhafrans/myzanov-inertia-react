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
        case "LOGIN":
            return "default"
        case "LOGOUT":
            return "secondary"
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

const detectDevice = (userAgent) => {
    if (!userAgent) return { type: 'Unknown', icon: '🖥️' }
    
    const ua = userAgent.toLowerCase()
    
    // Check for tablet
    if (ua.includes('ipad')) {
        return { type: 'Tablet', icon: '📱' }
    }
    if (ua.includes('android') && !ua.includes('mobile')) {
        return { type: 'Tablet', icon: '📱' }
    }
    
    // Check for mobile
    if (ua.includes('mobile') || 
        (ua.includes('android') && ua.includes('mobile')) ||
        ua.includes('iphone') ||
        ua.includes('windows phone')) {
        return { type: 'Mobile', icon: '📱' }
    }
    
    // Check for desktop
    if (ua.includes('windows') || 
        ua.includes('macintosh') || 
        ua.includes('linux') || 
        ua.includes('x11')) {
        return { type: 'Desktop', icon: '🖥️' }
    }
    
    return { type: 'Unknown', icon: '🖥️' }
}

export default function ActivityLogsTable({ logs, loading }) {
    const handlePageClick = (url) => {
        if (url) {
            router.get(url)
        }
    }

    return (
        <div className="space-y-4">
            {/* TABLE - Desktop */}
            <div className="hidden md:block relative border rounded-lg overflow-hidden">
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
                            <TableHead>Device</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {logs.data.length > 0 ? (
                            logs.data.map(log => {
                                const device = detectDevice(log.user_agent)
                                return (
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
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm">{device.icon}</span>
                                                <span className="text-xs text-muted-foreground">{device.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {log.ip_address}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(log.created_at)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No activity logs found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-0 overflow-hidden -mx-6">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
                {logs.data.length > 0 ? (
                    logs.data.map((log) => (
                        <div
                            key={log.id}
                            className="w-full px-6 border-x-0 border-y rounded-none first:border-t last:border-b bg-card hover:bg-muted/50 active:bg-muted transition-colors py-3"
                        >
                            {/* User & Action */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        User
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {log.user ? log.user.name : 'System'}
                                    </p>
                                </div>
                                <Badge variant={actionVariant(log.action)}>
                                    {log.action}
                                </Badge>
                            </div>

                            {/* Module & Description */}
                            <div className="mb-2">
                                {log.module && (
                                    <div className="mb-1">
                                        <p className="text-xs text-muted-foreground mb-0.5">
                                            Module
                                        </p>
                                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                                            {log.module}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Description
                                    </p>
                                    <p className="text-xs line-clamp-2">
                                        {log.description}
                                    </p>
                                </div>
                            </div>

                            {/* Device, IP Address & Date */}
                            <div className="flex items-center justify-between pt-2 border-t gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Device
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs">{detectDevice(log.user_agent).icon}</span>
                                        <p className="text-xs">
                                            {detectDevice(log.user_agent).type}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        IP Address
                                    </p>
                                    <p className="text-xs font-mono">
                                        {log.ip_address}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Date
                                    </p>
                                    <p className="text-xs">
                                        {formatDate(log.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground px-6">
                        No activity logs found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {logs.data.length > 0 && (
                <>
                    {/* Desktop Pagination */}
                    <div className="hidden md:flex items-center justify-between px-2 py-4">
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

                    {/* Mobile Pagination */}
                    <div className="md:hidden flex items-center justify-between gap-4 px-4 py-3 -mx-6 md:mx-0">
                        <div className="text-xs text-muted-foreground">
                            {logs.from}-{logs.to} of {logs.total}
                        </div>
                        <div className="flex gap-2 flex-1">
                            {(() => {
                                const prevLink = logs.links[0];
                                const nextLink = logs.links[logs.links.length - 1];
                                return (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => prevLink?.url && handlePageClick(prevLink.url)}
                                            disabled={!prevLink?.url}
                                            className="flex-1 text-xs"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => nextLink?.url && handlePageClick(nextLink.url)}
                                            disabled={!nextLink?.url}
                                            className="flex-1 text-xs"
                                        >
                                            Next
                                        </Button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}