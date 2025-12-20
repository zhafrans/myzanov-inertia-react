import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PIN_CODE = "0822";

export default function SummaryCards({ stats, loading = false }) {
    const [isPinVerified, setIsPinVerified] = useState(false);
    const [showPinDialog, setShowPinDialog] = useState(false);
    const [pinValues, setPinValues] = useState(["", "", "", ""]);
    const [pinError, setPinError] = useState("");
    const inputRefs = useRef([]);

    useEffect(() => {
        if (showPinDialog && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [showPinDialog]);

    useEffect(() => {
        const pinString = pinValues.join("");
        if (pinString.length === 4) {
            if (pinString === PIN_CODE) {
                setIsPinVerified(true);
                setShowPinDialog(false);
                setPinValues(["", "", "", ""]);
                setPinError("");
            } else {
                setPinError("PIN salah");
                setPinValues(["", "", "", ""]);
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }
        }
    }, [pinValues]);

    const handleEyeClick = () => {
        if (isPinVerified) {
            setIsPinVerified(false);
        } else {
            setShowPinDialog(true);
            setPinValues(["", "", "", ""]);
            setPinError("");
        }
    };

    const handlePinChange = (index, value) => {
        // Hanya terima angka
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newPinValues = [...pinValues];
        newPinValues[index] = value;
        setPinValues(newPinValues);
        setPinError("");

        // Auto focus ke kotak berikutnya jika ada input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePinKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === "Backspace" && !pinValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 4);
        if (/^\d{1,4}$/.test(pastedData)) {
            const newPinValues = pastedData
                .split("")
                .concat(Array(4 - pastedData.length).fill(""));
            setPinValues(newPinValues);
            const nextIndex = Math.min(pastedData.length, 3);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const items = [
        {
            label: "Total Tanggungan",
            value: stats?.totalTanggungan,
            requiresPin: true,
        },
        {
            label: "Total Terjual",
            value: stats?.totalTerjual,
            requiresPin: false,
        },
        {
            label: "Total Kartu Belum Lunas",
            value: stats?.belumLunas,
            requiresPin: false,
        },
        {
            label: "Total Sudah Lunas",
            value: stats?.sudahLunas,
            requiresPin: false,
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading
                    ? Array(4)
                          .fill()
                          .map((_, i) => <Skeleton key={i} className="h-32" />)
                    : items.map((item) => (
                          <Card key={item.label}>
                              <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                      <p className="text-sm text-muted-foreground">
                                          {item.label}
                                      </p>
                                      {item.requiresPin && (
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={handleEyeClick}
                                              className="h-8 w-8 p-0"
                                          >
                                              {isPinVerified ? (
                                                  <EyeOff className="h-4 w-4" />
                                              ) : (
                                                  <Eye className="h-4 w-4" />
                                              )}
                                          </Button>
                                      )}
                                  </div>
                                  <h2 className="text-2xl font-bold mt-1">
                                      {item.requiresPin && !isPinVerified
                                          ? "••••••••"
                                          : item.value || 0}
                                  </h2>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            <Dialog
                open={showPinDialog}
                onOpenChange={(open) => {
                    setShowPinDialog(open);
                    if (!open) {
                        setPinValues(["", "", "", ""]);
                        setPinError("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Masukkan PIN</DialogTitle>
                        <DialogDescription>
                            Masukkan PIN untuk melihat Total Tanggungan
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-center gap-3">
                                {pinValues.map((value, index) => (
                                    <input
                                        key={index}
                                        ref={(el) =>
                                            (inputRefs.current[index] = el)
                                        }
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={value}
                                        onChange={(e) =>
                                            handlePinChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handlePinKeyDown(index, e)
                                        }
                                        onPaste={handlePaste}
                                        className={cn(
                                            "w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors",
                                            pinError
                                                ? "border-red-500 focus:border-red-500"
                                                : "border-input"
                                        )}
                                    />
                                ))}
                            </div>
                            {pinError && (
                                <p className="text-sm text-red-500 text-center">
                                    {pinError}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowPinDialog(false);
                                    setPinValues(["", "", "", ""]);
                                    setPinError("");
                                }}
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
