import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function DashboardFilter({ onFilterChange }) {
    // Default: bulan ini (tanggal awal bulan - tanggal akhir bulan)
    const getDefaultDateRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            from: startOfMonth,
            to: endOfMonth,
        };
    };

    const [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [isAllTime, setIsAllTime] = useState(false);

    // Trigger filter change saat component mount dengan default value
    useEffect(() => {
        if (dateRange.from && dateRange.to && !isAllTime) {
            onFilterChange({
                start_date: format(dateRange.from, "yyyy-MM-dd"),
                end_date: format(dateRange.to, "yyyy-MM-dd"),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilter = () => {
        if (dateRange.from && dateRange.to) {
            setIsAllTime(false);
            onFilterChange({
                start_date: format(dateRange.from, "yyyy-MM-dd"),
                end_date: format(dateRange.to, "yyyy-MM-dd"),
            });
        }
    };

    const handleResetFilter = () => {
        const defaultRange = getDefaultDateRange();
        setDateRange(defaultRange);
        setIsAllTime(false);
        onFilterChange({
            start_date: format(defaultRange.from, "yyyy-MM-dd"),
            end_date: format(defaultRange.to, "yyyy-MM-dd"),
        });
    };

    const handleAllTime = () => {
        setDateRange({ from: null, to: null });
        setIsAllTime(true);
        onFilterChange({
            all_time: true,
        });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Filter Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full sm:w-auto">
                        <label className="text-sm font-medium mb-1 block">
                            Rentang Tanggal
                        </label>
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
                                                    { locale: id }
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                    dateRange.to,
                                                    "dd MMM yyyy",
                                                    { locale: id }
                                                )}
                                            </>
                                        ) : (
                                            format(
                                                dateRange.from,
                                                "dd MMM yyyy",
                                                { locale: id }
                                            )
                                        )
                                    ) : (
                                        <span>Pilih rentang tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleApplyFilter} className="h-10">
                            Terapkan Filter
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetFilter}
                            className="h-10"
                        >
                            Reset
                        </Button>
                        <Button
                            variant={isAllTime ? "default" : "secondary"}
                            onClick={handleAllTime}
                            className="h-10"
                        >
                            All Time
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
