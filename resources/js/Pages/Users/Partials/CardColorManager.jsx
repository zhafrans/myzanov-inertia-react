import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CardColorManager({ user, onColorUpdate }) {
    const [availableColors, setAvailableColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchAvailableColors();
    }, []);

    const fetchAvailableColors = async () => {
        try {
            const response = await fetch(route('users.colors.available'));
            const data = await response.json();
            setAvailableColors(data.colors);
        } catch (error) {
            console.error('Failed to fetch available colors:', error);
        }
    };

    const handleColorChange = async (colorName) => {
        setLoading(true);
        try {
            router.post(
                route('users.card-color.update', user.id),
                { color_name: colorName },
                {
                    onSuccess: (page) => {
                        toast.success('Warna kartu berhasil diperbarui');
                        onColorUpdate?.();
                        setShowModal(false);
                    },
                    onError: (errors) => {
                        toast.error('Gagal memperbarui warna kartu');
                        console.error('Errors:', errors);
                    },
                    onFinish: () => setLoading(false),
                }
            );
        } catch (error) {
            toast.error('Gagal memperbarui warna kartu');
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const handleRemoveColor = async () => {
        setLoading(true);
        try {
            router.delete(
                route('users.card-color.remove', user.id),
                {
                    onSuccess: (page) => {
                        toast.success('Warna kartu berhasil dihapus');
                        onColorUpdate?.();
                        setShowModal(false);
                    },
                    onError: (errors) => {
                        toast.error('Gagal menghapus warna kartu');
                        console.error('Errors:', errors);
                    },
                    onFinish: () => setLoading(false),
                }
            );
        } catch (error) {
            toast.error('Gagal menghapus warna kartu');
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const hasColor = user.card_color !== null && user.card_color !== undefined;

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                disabled={loading}
                onClick={() => setShowModal(true)}
            >
                {hasColor ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: user.card_color.hex_color }}
                        />
                        <span className="text-xs">{user.card_color.display_name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        <span className="text-xs">Set Warna</span>
                    </div>
                )}
            </Button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Atur Warna Kartu - {user.name}
                            </h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {hasColor && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-full border border-gray-300"
                                        style={{ backgroundColor: user.card_color.hex_color }}
                                    />
                                    <span className="text-sm font-medium">
                                        Warna Saat Ini: {user.card_color.display_name}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium text-gray-700">Pilih Warna:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {availableColors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorChange(color.name)}
                                        disabled={loading || user.card_color?.color_name === color.name}
                                        className="p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                                                style={{ backgroundColor: color.value }}
                                            />
                                            <div className="text-left">
                                                <div className="text-sm font-medium">{color.display_name}</div>
                                                {user.card_color?.color_name === color.name && (
                                                    <div className="text-xs text-green-600">Sedang Digunakan</div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasColor && (
                            <div className="border-t pt-4">
                                <Button
                                    variant="destructive"
                                    onClick={handleRemoveColor}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Hapus Warna
                                </Button>
                            </div>
                        )}

                        <div className="border-t pt-4 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="w-full"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
