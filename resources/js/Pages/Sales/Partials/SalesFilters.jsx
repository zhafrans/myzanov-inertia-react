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

export default function SalesFilters({ filters, setFilters }) {
    const [dateRange, setDateRange] = useState(() => {
        if (filters.startDate && filters.endDate) {
            return {
                from: new Date(filters.startDate),
                to: new Date(filters.endDate),
            };
        }
        return { from: null, to: null };
    });
    const [isAllTime, setIsAllTime] = useState(filters.all_time || false);

    useEffect(() => {
        if (filters.startDate && filters.endDate && !filters.all_time) {
            setDateRange({
                from: new Date(filters.startDate),
                to: new Date(filters.endDate),
            });
            setIsAllTime(false);
        } else if (filters.all_time) {
            setIsAllTime(true);
        }
    }, [filters.startDate, filters.endDate, filters.all_time]);

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            setIsAllTime(false);
            setFilters({
                ...filters,
                startDate: format(range.from, "yyyy-MM-dd"),
                endDate: format(range.to, "yyyy-MM-dd"),
                all_time: false,
            });
        }
    };

    const handleAllTime = () => {
        setIsAllTime(true);
        setDateRange({ from: null, to: null });
        setFilters({
            ...filters,
            startDate: "",
            endDate: "",
            all_time: true,
        });
    };

    const handleResetDate = () => {
        setIsAllTime(false);
        setDateRange({ from: null, to: null });
        setFilters({
            ...filters,
            startDate: "",
            endDate: "",
            all_time: false,
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full md:w-auto text-xs md:text-sm">
                    <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Filter
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 space-y-4">
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
                                            {format(dateRange.from, "dd MMM yyyy", {
                                                locale: id,
                                            })}{" "}
                                            -{" "}
                                            {format(dateRange.to, "dd MMM yyyy", {
                                                locale: id,
                                            })}
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
