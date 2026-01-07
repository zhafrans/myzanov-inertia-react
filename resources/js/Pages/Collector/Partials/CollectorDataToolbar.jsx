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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import LocationFilters from "../../Sales/Partials/LocationFilters";

export default function CollectorDataToolbar({ sellers = [], filters = {} }) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    // UI states for Date Picker - Dashboard style
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(null);

    // Sync localFilters with prop filters when Popover opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    // Sync UI states with localFilters
    useEffect(() => {
        if (localFilters.startDate && localFilters.endDate) {
            const startDate = new Date(localFilters.startDate);
            setSelectedYear(startDate.getFullYear());
            setSelectedMonth(startDate);
        } else if (localFilters.all_time) {
            setSelectedYear(new Date().getFullYear());
            setSelectedMonth(null);
        }
    }, [localFilters.startDate, localFilters.endDate, localFilters.all_time]);

    const handleApplyFilter = () => {
        let newFilters = { ...localFilters };
        
        if (selectedMonth) {
            // Calculate date range based on selected month and year
            const startOfMonth = new Date(selectedYear, selectedMonth.getMonth(), 1);
            const endOfMonth = new Date(selectedYear, selectedMonth.getMonth() + 1, 0);
            
            newFilters.startDate = startOfMonth.getFullYear() + '-' + String(startOfMonth.getMonth() + 1).padStart(2, '0') + '-' + String(startOfMonth.getDate()).padStart(2, '0');
            newFilters.endDate = endOfMonth.getFullYear() + '-' + String(endOfMonth.getMonth() + 1).padStart(2, '0') + '-' + String(endOfMonth.getDate()).padStart(2, '0');
            newFilters.all_time = false;
        } else {
            // If no month selected, use current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            newFilters.startDate = startOfMonth.getFullYear() + '-' + String(startOfMonth.getMonth() + 1).padStart(2, '0') + '-' + String(startOfMonth.getDate()).padStart(2, '0');
            newFilters.endDate = endOfMonth.getFullYear() + '-' + String(endOfMonth.getMonth() + 1).padStart(2, '0') + '-' + String(endOfMonth.getDate()).padStart(2, '0');
            newFilters.all_time = false;
        }
        
        router.get(url, newFilters, {
            preserveState: true,
            replace: true,
        });
        setIsOpen(false);
    };

    const handleResetFilter = () => {
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(null);
        router.get(url, {}, {
            preserveState: true,
            replace: true,
        });
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto text-xs md:text-sm"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-4" align="start">
                        <div className="space-y-4">
                            <h4 className="font-medium">Filter Data</h4>
                            
                            {/* Search */}
                            <div>
                                <Label htmlFor="search" className="text-sm">Pencarian</Label>
                                <Input
                                    id="search"
                                    placeholder="Cari invoice, nama, produk..."
                                    value={localFilters.search || ""}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                        }))
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {/* Payment Type */}
                            <div>
                                <Label htmlFor="payment_type" className="text-sm">Tipe Pembayaran</Label>
                                <Select
                                    value={localFilters.payment_type || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            payment_type: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="installment">Installment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Seller */}
                            <div>
                                <Label htmlFor="seller_id" className="text-sm">Sales</Label>
                                <Select
                                    value={localFilters.seller_id || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            seller_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua sales" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Sales</SelectItem>
                                        {sellers.map((seller) => (
                                            <SelectItem key={seller.id} value={seller.id.toString()}>
                                                {seller.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div>
                                <Label htmlFor="status" className="text-sm">Status Pembayaran</Label>
                                <Select
                                    value={localFilters.status || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            status: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="paid">Sudah Lunas</SelectItem>
                                        <SelectItem value="unpaid">Belum Lunas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Location Filters */}
                            <LocationFilters
                                filters={localFilters}
                                setFilters={setLocalFilters}
                            />

                            {/* Date Range - Dashboard Style */}
                            <div>
                                <Label className="text-sm">Rentang Tanggal</Label>
                                <div className="mt-1 space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Tahun</Label>
                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Tahun" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[2024, 2025, 2026, 2027, 2028].map(year => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Bulan</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {selectedMonth ? format(selectedMonth, "MMMM yyyy", { locale: id }) : "Pilih Bulan"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedMonth}
                                                        onSelect={setSelectedMonth}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleApplyFilter} className="flex-1">
                                    Terapkan Filter
                                </Button>
                                <Button variant="outline" onClick={handleResetFilter}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}