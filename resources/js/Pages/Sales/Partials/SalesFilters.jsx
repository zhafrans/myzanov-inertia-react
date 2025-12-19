import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"

export default function SalesFilters({ filters, setFilters, availableSizes }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-56 space-y-4">
                {/* Filter Size */}
                <div>
                    <p className="text-sm font-medium mb-1">Size</p>
                    <Select
                        value={filters.size}
                        onValueChange={v =>
                            setFilters({ size: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            {availableSizes?.map(size => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Filter Tanggal Pengambilan */}
                <div>
                    <p className="text-sm font-medium mb-1">
                        Tanggal Pengambilan
                    </p>
                    <Select
                        value={filters.sort}
                        onValueChange={v =>
                            setFilters({ sort: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Terbaru/Terlama" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Terbaru</SelectItem>
                            <SelectItem value="asc">Terlama</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Filter Status Lunas */}
                <div>
                    <p className="text-sm font-medium mb-1">Status Lunas</p>
                    <Select
                        value={filters.status}
                        onValueChange={v =>
                            setFilters({ status: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="paid">Sudah Lunas</SelectItem>
                            <SelectItem value="unpaid">Belum Lunas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Filter Belum Tertagih Bulan Ini */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="notCollectedThisMonth"
                        checked={filters.notCollectedThisMonth || false}
                        onChange={e =>
                            setFilters({
                                notCollectedThisMonth: e.target.checked,
                            })
                        }
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <label
                        htmlFor="notCollectedThisMonth"
                        className="text-sm select-none"
                    >
                        Belum Tertagih Bulan Ini
                    </label>
                </div>
            </PopoverContent>
        </Popover>
    )
}