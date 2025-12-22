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
import LocationFilters from "./LocationFilters";

export default function SalesFilters({ filters, setFilters }) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    // UI states for Date Picker
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [isAllTime, setIsAllTime] = useState(false);

    // Sync localFilters with prop filters when Popover opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    // Sync UI states (dateRange, isAllTime) with localFilters
    useEffect(() => {
        if (
            localFilters.startDate &&
            localFilters.endDate &&
            !localFilters.all_time
        ) {
            setDateRange({
                from: new Date(localFilters.startDate),
                to: new Date(localFilters.endDate),
            });
            setIsAllTime(false);
        } else if (localFilters.all_time) {
            setIsAllTime(true);
            setDateRange({ from: null, to: null });
        } else {
            setDateRange({ from: null, to: null });
            setIsAllTime(false);
        }
    }, [localFilters.startDate, localFilters.endDate, localFilters.all_time]);

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            setLocalFilters((prev) => ({
                ...prev,
                startDate: format(range.from, "yyyy-MM-dd"),
                endDate: format(range.to, "yyyy-MM-dd"),
                all_time: false,
            }));
        }
    };

    const handleAllTime = () => {
        setLocalFilters((prev) => ({
            ...prev,
            startDate: "",
            endDate: "",
            all_time: true,
        }));
    };

    const handleResetDate = () => {
        setLocalFilters((prev) => ({
            ...prev,
            startDate: "",
            endDate: "",
            all_time: false,
        }));
    };

    const handleApply = () => {
        setFilters(localFilters);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto text-xs md:text-sm"
                >
                    <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Filter
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Date Range Filter */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold">Rentang Tanggal</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {isAllTime ? (
                                    <span>All Time</span>
                                ) : dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(
                                                dateRange.from,
                                                "dd MMM yyyy",
                                                {
                                                    locale: id,
                                                }
                                            )}{" "}
                                            -{" "}
                                            {format(
                                                dateRange.to,
                                                "dd MMM yyyy",
                                                {
                                                    locale: id,
                                                }
                                            )}
                                        </>
                                    ) : (
                                        format(dateRange.from, "dd MMM yyyy", {
                                            locale: id,
                                        })
                                    )
                                ) : (
                                    <span>Pilih rentang tanggal</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="flex gap-2">
                        <Button
                            variant={isAllTime ? "default" : "secondary"}
                            onClick={handleAllTime}
                            size="sm"
                            className="flex-1"
                        >
                            All Time
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetDate}
                            size="sm"
                            className="flex-1"
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="border-t pt-3 space-y-4">
                    {/* Filter Payment Type */}
                    <div>
                        <p className="text-sm font-medium mb-1">
                            Tipe Pembayaran
                        </p>
                        <Select
                            value={localFilters.payment_type || "all"}
                            onValueChange={(v) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    payment_type: v,
                                }))
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
                            value={localFilters.sort}
                            onValueChange={(v) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    sort: v,
                                }))
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
                            value={localFilters.status}
                            onValueChange={(v) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    status: v,
                                }))
                            }
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
                            checked={
                                localFilters.notCollectedThisMonth || false
                            }
                            onChange={(e) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    notCollectedThisMonth: e.target.checked,
                                }))
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
                    <LocationFilters
                        filters={localFilters}
                        setFilters={setLocalFilters}
                    />

                    {/* Apply Button */}
                    <div className="pt-4 border-t mt-4 sticky bottom-0 bg-background pb-2">
                        <Button className="w-full" onClick={handleApply}>
                            Terapkan Filter
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
