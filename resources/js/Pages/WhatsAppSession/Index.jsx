import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

export default function WhatsAppSessionIndex() {
    const [sessionStatus, setSessionStatus] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    
    // Fungsi untuk mengonversi QR code ke format data URL jika diperlukan
    const formatQRCode = (qrData) => {
        if (!qrData) return null;
        
        // Jika qrData sudah dalam format data URL, kembalikan langsung
        if (qrData.startsWith('data:image/')) {
            // Hapus duplikasi prefix jika ada
            if (qrData.startsWith('data:image/png;base64,data:image/png;base64,')) {
                return qrData.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
            }
            return qrData;
        }
        
        // Jika qrData hanya berupa base64 string, tambahkan prefix data URL
        return `data:image/png;base64,${qrData}`;
    };

    const [loading, setLoading] = useState(false);
    const [sessionId] = useState("myzanov"); // Using a fixed session ID

    const API_BASE_URL = "https://whatsapp.venusverse.me/api";
    const API_KEY = "a1bcb546a3454ec993cf6ffba50a5df6d1b66f206f4b49c9a500d895cabdbde8";

    const checkSessionStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/status`, {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setSessionStatus(data.data);
                
                // If not connected, generate QR code
                if (!data.data.connected && data.data.status !== 'connected') {
                    generateQRCode();
                } else {
                    // If already connected, clear QR code
                    setQrCode(null);
                }
            } else {
                toast.error("Failed to check session status");
            }
        } catch (error) {
            console.error("Error checking session status:", error);
            toast.error("Error checking session status");
        } finally {
            setLoading(false);
        }
    };

    const generateQRCode = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/session/create`, {
                method: "POST",
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                if (data.data.qr) {
                    const formattedQR = formatQRCode(data.data.qr);
                    setQrCode(formattedQR);
                    setSessionStatus(prev => ({
                        ...prev,
                        status: data.data.status,
                        connected: false
                    }));
                } else if (data.data.connected) {
                    // If already connected, just update status without QR code
                    setSessionStatus(data.data);
                    setQrCode(null);
                } else {
                    toast.error("Failed to generate QR code");
                }
            } else {
                toast.error("Failed to generate QR code");
            }
        } catch (error) {
            console.error("Error generating QR code:", error);
            toast.error("Error generating QR code");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSessionStatus();
    }, []);

    const handleRefresh = () => {
        generateQRCode();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>WhatsApp Session</span>
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {sessionStatus && sessionStatus.connected ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✓</span>
                            </div>
                            <h3 className="font-semibold text-lg">Connected</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                {sessionStatus.phoneNumber} - {sessionStatus.name}
                            </p>
                            <Badge className="mt-4" variant="default">
                                Connected
                            </Badge>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <QrCode className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Scan QR Code</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">
                                Open WhatsApp on your phone, go to Settings > Linked Devices > Link a Device
                            </p>
                            
                            {qrCode && (
                                <div className="mt-4 p-4 bg-white rounded-lg inline-block border mx-auto">
                                    <img 
                                        src={qrCode} 
                                        alt="QR Code" 
                                        className="w-64 h-64"
                                    />
                                </div>
                            )}
                            
                            <div className="mt-6">
                                <Button 
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Refresh QR Code
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

WhatsAppSessionIndex.layout = page => (
    <AppLayout title="WhatsApp Session">
        {page}
    </AppLayout>
);