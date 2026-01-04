import AppLayout from "@/Layouts/AppLayout"
import { Head, router, usePage } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Badge } from "@/Components/ui/badge"
import { Clock, Calendar, Save, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"

export default function WaSchedulesIndex({ schedules }) {
    const [data, setData] = useState(() => {
        // Convert old format to new Carbon format on initial load
        return schedules.map(schedule => {
            if (schedule.type === 'weekly' && schedule.weekly_day === 7) {
                // Convert old Sunday (7) to Carbon Sunday (0)
                return { ...schedule, weekly_day: 0 }
            }
            return schedule
        })
    })
    const [loading, setLoading] = useState(false)
    const { flash } = usePage().props

    // Show flash messages from backend
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success)
        }
        if (flash?.error) {
            toast.error(flash.error)
        }
    }, [flash])

    const handleUpdate = (id, field, value) => {
        // Handle weekly_day conversion if needed
        let processedValue = value
        if (field === 'weekly_day') {
            // Convert old format (1-7) to new Carbon format (0-6) if needed
            processedValue = parseInt(value)
            if (processedValue === 7) {
                processedValue = 0 // Convert old Sunday (7) to Carbon Sunday (0)
            }
        }
        
        setData(prev => prev.map(schedule => 
            schedule.id === id ? { ...schedule, [field]: processedValue } : schedule
        ))
    }

    const handleSubmit = (scheduleId) => {
        const schedule = data.find(s => s.id === scheduleId)
        
        if (!schedule) {
            toast.error('Jadwal tidak ditemukan')
            return
        }
        
        // Validation
        if (schedule.type === 'daily' && !schedule.daily_at) {
            toast.error('Waktu pengiriman harian harus diisi')
            return
        }
        
        if (schedule.type === 'weekly') {
            if (schedule.weekly_day === null || schedule.weekly_day === '' || schedule.weekly_day === undefined) {
                toast.error('Hari pengiriman mingguan harus dipilih')
                return
            }
            if (!schedule.weekly_at) {
                toast.error('Waktu pengiriman mingguan harus diisi')
                return
            }
        }
        
        setLoading(true)
        
        router.put(
            route('wa-schedules.update', scheduleId),
            {
                daily_at: schedule.daily_at ? schedule.daily_at.substring(0, 5) : null, // HH:mm format
                weekly_day: schedule.weekly_day,
                weekly_at: schedule.weekly_at ? schedule.weekly_at.substring(0, 5) : null, // HH:mm format
                type: schedule.type
            },
            {
                onSuccess: (page) => {
                    // Show success toast
                    toast.success('Jadwal WhatsApp berhasil diperbarui!')
                    
                    // Update local data with response
                    if (page.props.schedules) {
                        setData(page.props.schedules)
                    }
                },
                onError: (errors) => {
                    // Show error toast for each validation error
                    if (typeof errors === 'object') {
                        Object.values(errors).forEach(error => {
                            toast.error(error)
                        })
                    } else {
                        toast.error('Terjadi kesalahan saat memperbarui jadwal')
                    }
                },
                onFinish: () => setLoading(false)
            }
        )
    }

    const getDayName = (dayNumber) => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        return days[dayNumber] || ''
    }

    return (
        <div className="space-y-6">
            <Head title="Jadwal WhatsApp" />
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Jadwal WhatsApp</h1>
                    <p className="text-muted-foreground">Kelola jadwal pengiriman laporan harian dan mingguan</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {data.map((schedule) => (
                    <Card key={schedule.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    {schedule.type === 'daily' ? (
                                        <>
                                            <Clock className="h-5 w-5" />
                                            Laporan Harian
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="h-5 w-5" />
                                            Laporan Mingguan
                                        </>
                                    )}
                                </CardTitle>
                                <Badge variant={schedule.type === 'daily' ? 'default' : 'secondary'}>
                                    {schedule.type === 'daily' ? 'Harian' : 'Mingguan'}
                                </Badge>
                            </div>
                            <CardDescription>
                                {schedule.type === 'daily' 
                                    ? 'Pengiriman laporan penjualan harian (exclude Umi)'
                                    : 'Pengiriman laporan penjualan mingguan (Senin-Sabtu, semua sales)'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {schedule.type === 'daily' ? (
                                <div className="space-y-2">
                                    <Label htmlFor={`daily_at-${schedule.id}`}>Waktu Pengiriman</Label>
                                    <Input
                                        id={`daily_at-${schedule.id}`}
                                        type="time"
                                        value={schedule.daily_at || ''}
                                        onChange={(e) => handleUpdate(schedule.id, 'daily_at', e.target.value)}
                                        placeholder="08:00"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor={`weekly_day-${schedule.id}`}>Hari Pengiriman</Label>
                                        <select
                                            id={`weekly_day-${schedule.id}`}
                                            value={schedule.weekly_day !== null && schedule.weekly_day !== '' ? schedule.weekly_day : ''}
                                            onChange={(e) => handleUpdate(schedule.id, 'weekly_day', parseInt(e.target.value))}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Pilih Hari</option>
                                            <option value="1">Senin</option>
                                            <option value="2">Selasa</option>
                                            <option value="3">Rabu</option>
                                            <option value="4">Kamis</option>
                                            <option value="5">Jumat</option>
                                            <option value="6">Sabtu</option>
                                            <option value="0">Minggu</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`weekly_at-${schedule.id}`}>Waktu Pengiriman</Label>
                                        <Input
                                            id={`weekly_at-${schedule.id}`}
                                            type="time"
                                            value={schedule.weekly_at || ''}
                                            onChange={(e) => handleUpdate(schedule.id, 'weekly_at', e.target.value)}
                                            placeholder="08:00"
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="pt-4">
                                <Button 
                                    onClick={() => handleSubmit(schedule.id)}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Simpan Jadwal
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Tambahan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="font-semibold mb-2">Laporan Harian</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Dikirim setiap hari pada waktu yang ditentukan</li>
                                <li>• Exclude penjualan dari Umi</li>
                                <li>• Data penjualan kemarin</li>
                                <li>• Summary AI dan statistik per seller</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Laporan Mingguan</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Dikirim setiap minggu pada hari & waktu yang ditentukan</li>
                                <li>• Semua sales termasuk Umi</li>
                                <li>• Data penjualan Senin-Sabtu minggu lalu</li>
                                <li>• Summary AI komprehensif mingguan</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

WaSchedulesIndex.layout = page => (
    <AppLayout title="Jadwal WhatsApp">
        {page}
    </AppLayout>
)
