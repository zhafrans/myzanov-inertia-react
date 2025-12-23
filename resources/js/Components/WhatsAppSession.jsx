import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";
import { toast } from "react-toastify";

const WhatsAppSession = ({ isOpen, onClose }) => {
    const [sessionStatus, setSessionStatus] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState("myzanov");

    const API_BASE_URL = "https://whatsapp.venusverse.me/api";
    const API_KEY = "a1bcb546a3454ec993cf6ffba50a5df6d1b66f206f4b49c9a500d895cabdbde8";

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

    // Check session status when component opens and handle accordingly
    const checkSessionStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/session/${sessionId}/status`, {
                headers: {
                    "x-api-key": API_KEY,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Session status response:", data);
            
            if (data.success) {
                setSessionStatus(data.data);
                
                // If not connected, generate QR code
                if (!data.data.connected && data.data.status !== 'connected') {
                    await generateQRCode();
                } else {
                    // If already connected, clear QR code
                    setQrCode(null);
                }
            } else {
                toast.error("Failed to check session status");
            }
        } catch (error) {
            console.error("Error checking session status:", error);
            toast.error("Error checking session status: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateQRCode = async () => {
        setLoading(true);
        setQrCode(null); // Reset QR code sebelum generate baru
        
        try {
            console.log("Generating QR code for session:", sessionId);
            
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("QR code response:", {
                success: data.success,
                hasQR: !!data.data?.qr,
                qrLength: data.data?.qr?.length,
                qrFirstChars: data.data?.qr?.substring(0, 100)
            });
            
            if (data.success) {
                if (data.data.qr) {
                    const formattedQR = formatQRCode(data.data.qr);
                    
                    if (formattedQR) {
                        console.log("Setting formatted QR code, length:", formattedQR.length);
                        setQrCode(formattedQR);
                        
                        setSessionStatus(prev => ({
                            ...prev,
                            status: data.data.status,
                            connected: false
                        }));
                        
                        toast.success("QR code generated successfully");
                    } else {
                        console.error("Invalid QR code format received");
                        toast.error("Invalid QR code format received");
                    }
                } else if (data.data.connected) {
                    // If already connected, just update status without QR code
                    setSessionStatus(data.data);
                    setQrCode(null);
                    console.log("Session already connected");
                } else {
                    console.error("Failed to generate QR code:", data);
                    toast.error("Failed to generate QR code: " + (data.message || "Unknown error"));
                }
            } else {
                console.error("Failed to generate QR code:", data);
                toast.error("Failed to generate QR code: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error generating QR code:", error);
            toast.error("Error generating QR code: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            checkSessionStatus();
        }
    }, [isOpen]);

    const handleRefresh = () => {
        generateQRCode();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>WhatsApp Session</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            ✕
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionStatus && sessionStatus.connected ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✓</span>
                            </div>
                            <h3 className="font-semibold text-lg">Connected</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {sessionStatus.phoneNumber} - {sessionStatus.name}
                            </p>
                            <Badge className="mt-3" variant="default">
                                Connected
                            </Badge>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <QrCode className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Scan QR Code</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Open WhatsApp on your phone, go to Settings › Linked Devices › Link a Device
                            </p>
                            
                            {qrCode ? (
                                <div className="mt-4 p-3 bg-white rounded-lg inline-block">
                                    <img 
                                        src={qrCode}
                                        alt="WhatsApp QR Code" 
                                        className="w-48 h-48 mx-auto"
                                        onLoad={() => console.log("QR code loaded successfully")}
                                        onError={(e) => {
                                            console.error("Error loading QR code image:", e);
                                            console.log("Failed QR code src (first 200 chars):", qrCode.substring(0, 200));
                                            e.target.style.display = 'none';
                                            toast.error("Failed to load QR code image");
                                        }}
                                    />
                                </div>
                            ) : loading ? (
                                <div className="mt-4 flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <div className="mt-4 text-red-500">
                                    No QR code available. Please refresh.
                                </div>
                            )}
                            
                            <div className="mt-4">
                                <Button 
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Loading...
                                        </>
                                    ) : "Refresh QR Code"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WhatsAppSession;