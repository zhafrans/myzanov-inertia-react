import { router } from "@inertiajs/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"
import { useState, useEffect } from "react"

export default function FilterForm({ filters: initialFilters, users, actions, modules, setLoading }) {
    const [localFilters, setLocalFilters] = useState({
        search: initialFilters.search || '',
        user_id: initialFilters.user_id || '',
        action: initialFilters.action || '',
        module: initialFilters.module || '',
        start_date: initialFilters.start_date || '',
        end_date: initialFilters.end_date || '',
    })

    // Debounce untuk search
    useEffect(() => {
        const timer = setTimeout(() => {
            // Cek apakah ada perubahan di search
            if (localFilters.search !== (initialFilters.search || '')) {
                applyFilters(localFilters)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [localFilters.search])

    const handleFilterChange = (field, value) => {
        let newValue = value
        if (value === 'all') {
            newValue = ''
        }

        const updatedFilters = {
            ...localFilters,
            [field]: newValue
        }

        setLocalFilters(updatedFilters)

        // Untuk field selain search, langsung trigger tanpa debounce
        if (field !== 'search') {
            applyFilters(updatedFilters)
        }
    }

    const applyFilters = (filters) => {
        const finalFilters = { ...filters }

        // Clean up empty values (jangan kirim ke server jika kosong)
        if (!finalFilters.search) delete finalFilters.search
        if (!finalFilters.user_id) delete finalFilters.user_id
        if (!finalFilters.action) delete finalFilters.action
        if (!finalFilters.module) delete finalFilters.module
        if (!finalFilters.start_date) delete finalFilters.start_date
        if (!finalFilters.end_date) delete finalFilters.end_date

        setLoading(true)

        router.get(route('activity-logs.index'), finalFilters, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false)
        })
    }

    const handleReset = () => {
        const resetFilters = {
            search: '',
            user_id: '',
            action: '',
            module: '',
            start_date: '',
            end_date: '',
        }
        
        setLocalFilters(resetFilters)

        setLoading(true)
        router.get(route('activity-logs.index'), {}, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false)
        })
    }

    return (
        <div className="border rounded-lg p-4 space-y-4 relative -mx-6 md:mx-0 px-6 md:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Search description..."
                            className="pl-8"
                            value={localFilters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                {/* User Filter */}
                <div className="space-y-2">
                    <Label htmlFor="user">User</Label>
                    <Select
                        value={localFilters.user_id}
                        onValueChange={(value) => handleFilterChange('user_id', value)}
                    >
                        <SelectTrigger>
                            <div className="flex items-center">
                                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="All Users" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {users.map(user => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Select
                        value={localFilters.action}
                        onValueChange={(value) => handleFilterChange('action', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {actions.map(action => (
                                <SelectItem key={action} value={action}>
                                    {action}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Module Filter */}
                <div className="space-y-2">
                    <Label htmlFor="module">Module</Label>
                    <Select
                        value={localFilters.module}
                        onValueChange={(value) => handleFilterChange('module', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Modules" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Modules</SelectItem>
                            {modules.map(module => (
                                <SelectItem key={module} value={module}>
                                    {module}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filters */}
                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={localFilters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={localFilters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Reset Filters
                </Button>
            </div>
        </div>
    )
}