// components/DashboardFilter.jsx
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default function DashboardFilter({ onFilterChange }) {
    const [years, setYears] = useState([])
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        // Fetch tahun tersedia dari API
        axios.get('/api/dashboard/years')
            .then(response => {
                setYears(response.data)
            })
    }, [])

    const handleApplyFilter = () => {
        onFilterChange({
            year: selectedYear,
            month: selectedMonth,
        })
    }

    const handleResetFilter = () => {
        setSelectedYear(new Date().getFullYear())
        setSelectedMonth(null)
        setDate(new Date())
        onFilterChange({
            year: new Date().getFullYear(),
            month: null,
        })
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Filter Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Tahun</label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Bulan</label>
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
                    
                    <div className="flex items-end gap-2">
                        <Button onClick={handleApplyFilter} className="h-10">
                            Terapkan Filter
                        </Button>
                        <Button variant="outline" onClick={handleResetFilter} className="h-10">
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}