import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function SalesFilters({ filters, setFilters }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-72 space-y-4">
                {/* Date Range Filter */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold">Rentang Tanggal</p>
                    <div className="space-y-2">
                        <div>
                            <Label htmlFor="startDate" className="text-xs">
                                Dari Tanggal
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={filters.startDate || ""}
                                onChange={(e) =>
                                    setFilters({ ...filters, startDate: e.target.value })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate" className="text-xs">
                                Sampai Tanggal
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={filters.endDate || ""}
                                onChange={(e) =>
                                    setFilters({ ...filters, endDate: e.target.value })
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-3 space-y-4">
                    {/* Filter Payment Type */}
                    <div>
                        <p className="text-sm font-medium mb-1">
                            Tipe Pembayaran
                        </p>
                        <Select
                            value={filters.payment_type || "all"}
                            onValueChange={(v) =>
                                setFilters({ ...filters, payment_type: v })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                                <SelectItem value="cash_tempo">
                                    Cash Tempo
                                </SelectItem>
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
                            onValueChange={(v) => setFilters({ ...filters, sort: v })}
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
                            onValueChange={(v) => setFilters({ ...filters, status: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="paid">
                                    Sudah Lunas
                                </SelectItem>
                                <SelectItem value="unpaid">
                                    Belum Lunas
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter Belum Tertagih Bulan Ini */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="notCollectedThisMonth"
                            checked={filters.notCollectedThisMonth || false}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
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
                </div>
            </PopoverContent>
        </Popover>
    );
}
