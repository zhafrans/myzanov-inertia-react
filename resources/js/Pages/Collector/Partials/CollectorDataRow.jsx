import { Badge } from "@/components/ui/badge";
import { router } from "@inertiajs/react";

export default function CollectorDataRow({ item }) {
    const handleRowClick = () => {
        console.log('Row clicked, item ID:', item.id);
        router.get(route("sales.show", item.id));
    };

    const getStatusBadge = (remainingAmount) => {
        if (remainingAmount > 0) {
            return (
                <Badge variant="destructive" className="text-xs">
                    Belum Lunas
                </Badge>
            );
        }
        return (
            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                    Lunas
                </Badge>
        );
    };

    return (
        <tr className="cursor-pointer hover:bg-gray-50 transition-colors border-b" onClick={handleRowClick} style={{ cursor: 'pointer' }}>
            <td className="px-6 py-4">
                <div className="font-medium text-sm">{item.card_number || '-'}</div>
            </td>
            <td className="px-6 py-4">
                <div>
                    <div className="text-sm font-medium">{item.customer_name}</div>
                    <div className="text-xs text-gray-500">{item.phone || '-'}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">{item.seller?.name || '-'}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    <div>{item.city?.name || '-'}</div>
                    <div className="text-xs text-gray-500">{item.subdistrict?.name || '-'}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    {new Date(item.transaction_at).toLocaleDateString('id-ID')}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium">
                    Rp {item.price.toLocaleString('id-ID')}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="space-y-1">
                    {getStatusBadge(item.remaining_amount)}
                    {item.remaining_amount > 0 && (
                        <div className="text-xs text-red-600">
                            Sisa: Rp {item.remaining_amount.toLocaleString('id-ID')}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
