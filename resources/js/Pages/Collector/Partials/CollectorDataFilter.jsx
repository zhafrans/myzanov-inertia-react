import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LocationFilters from "../../Sales/Partials/LocationFilters"

export default function CollectorDataFilter({ onFilterChange, sellers = [], initialFilters = {} }) {
    const [localFilters, setLocalFilters] = useState(initialFilters)
    
    // UI states for Date Range Picker - Single picker like SalesPerformance
    const [dateRange, setDateRange] = useState({ from: null, to: null })
    const [isAllTime, setIsAllTime] = useState(false)

    useEffect(() => {
        // Set initial filters
        setLocalFilters(initialFilters)
        
        // If no date filters are set, default to all time
        if (!initialFilters.startDate && !initialFilters.endDate && !initialFilters.all_time) {
            const defaultFilters = {
                ...initialFilters,
                startDate: "",
                endDate: "",
                all_time: true,
            };
            setLocalFilters(defaultFilters);
            setDateRange({ from: null, to: null });
            setIsAllTime(true);
        } else if (initialFilters.startDate && initialFilters.endDate) {
            setDateRange({
                from: new Date(initialFilters.startDate),
                to: new Date(initialFilters.endDate)
            })
            setIsAllTime(false)
        } else if (initialFilters.all_time) {
            setIsAllTime(true)
            setDateRange({ from: null, to: null })
        }
    }, [initialFilters])

    const handleDateRangeChange = (range) => {
        setDateRange(range)
        if (range?.from && range?.to) {
            setLocalFilters((prev) => ({
                ...prev,
                startDate: range.from.getFullYear() + '-' + String(range.from.getMonth() + 1).padStart(2, '0') + '-' + String(range.from.getDate()).padStart(2, '0'),
                endDate: range.to.getFullYear() + '-' + String(range.to.getMonth() + 1).padStart(2, '0') + '-' + String(range.to.getDate()).padStart(2, '0'),
                all_time: false,
            }))
        }
    }

    const handleAllTime = () => {
        const newFilters = {
            ...localFilters,
            startDate: "",
            endDate: "",
            all_time: true,
        };
        setLocalFilters(newFilters);
        setDateRange({ from: null, to: null });
        setIsAllTime(true);
        onFilterChange(newFilters); // Apply filter immediately
    }

    const handleResetDate = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const newFilters = {
            ...localFilters,
            startDate: firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'),
            endDate: lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0'),
            all_time: false,
        };
        setLocalFilters(newFilters);
        setDateRange({ from: firstDay, to: lastDay });
        setIsAllTime(false);
        onFilterChange(newFilters); // Apply filter immediately
    }

    const handleApplyFilter = () => {
        onFilterChange(localFilters)
    }

    const handleResetFilter = () => {
        const resetFilters = {
            search: '',
            payment_type: 'all',
            seller_id: 'all',
            status: 'unpaid',
            province_id: '',
            city_id: '',
            subdistrict_id: '',
            village_id: '',
            startDate: '',
            endDate: '',
            all_time: true
        }
        setLocalFilters(resetFilters)
        setDateRange({ from: null, to: null })
        setIsAllTime(true)
        onFilterChange(resetFilters)
    }

    return (
        <Card className="mb-6">
            <CardHeader className="px-6 pb-4">
                <CardTitle>Filter Collector Data</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6">
                {/* Date Range Input - Single picker like SalesPerformance */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-left font-normal"
                                    disabled={isAllTime}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from && dateRange.to ? (
                                        `${format(dateRange.from, "dd MMM yyyy", { locale: id })} - ${format(dateRange.to, "dd MMM yyyy", { locale: id })}`
                                    ) : (
                                        "Pilih rentang tanggal"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleDateRangeChange}
                                    initialFocus
                                    disabled={isAllTime}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <div className="flex items-end gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleResetDate}
                            className="h-10"
                        >
                            Bulan Ini
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

                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Payment Type */}
                    <div>
                        <label className="text-sm font-medium mb-1 block">Tipe Pembayaran</label>
                        <Select
                            value={localFilters.payment_type || "all"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    payment_type: value,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="cash_tempo">Cash Tempo</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Seller */}
                    <div>
                        <label className="text-sm font-medium mb-1 block">Sales</label>
                        <Select
                            value={localFilters.seller_id || "all"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    seller_id: value,
                                }))
                            }
                        >
                            <SelectTrigger>
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
                        <label className="text-sm font-medium mb-1 block">Status Pembayaran</label>
                        <Select
                            value={localFilters.status || "all"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    status: value,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Location Filters */}
                <div className="mt-4">
                    <LocationFilters
                        filters={localFilters}
                        setFilters={setLocalFilters}
                    />
                </div>

                {/* Filter Buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                    <Button 
                        onClick={handleApplyFilter}
                        className="h-10"
                    >
                        Filter
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleResetFilter}
                        className="h-10"
                    >
                        Reset Filter
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
