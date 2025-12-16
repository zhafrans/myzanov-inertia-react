import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const data = {
    customer: {
        cardNo: "0610",
        name: "B. DIDIN",
        phone: "-",
    },
    address: {
        street: "SD 4 SUMINGKIR RANDUDONGKAL",
        subdistrict: "RANDUDONGKAL",
        city: "PEMALANG",
    },
    salesName: "UMI",
    items: [
        {
            product: "A551",
            color: "H",
            size: "41",
            price: 125000,
        },
        {
            product: "A552",
            color: "Hitam",
            size: "40",
            price: 100000,
        },
    ],
    remaining: 0,
}


export default function SalesDetailInfo() {
    const isLunas = data.remaining === 0

    const totalPrice = data.items.reduce(
        (sum, item) => sum + item.price,
        0
    )

    return (
        <div className="space-y-4">
            {/* STATUS */}
            <div className="text-center">
                {isLunas ? (
                    <div className="text-4xl font-extrabold text-green-600">
                        LUNAS
                    </div>
                ) : (
                    <Badge variant="destructive" className="text-lg px-6 py-2">
                        BELUM LUNAS
                    </Badge>
                )}
            </div>

            {/* CUSTOMER */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Customer</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <Info label="No Kartu" value={data.customer.cardNo} />
                    <Info label="Nama" value={data.customer.name} />
                    <Info label="No. Telp" value={data.customer.phone} />
                    <Info label="Nama Sales" value={data.salesName} />
                </CardContent>
            </Card>

            {/* ADDRESS */}
            <Card>
                <CardHeader>
                    <CardTitle>Alamat</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p>{data.address.street}</p>
                    <p>Kecamatan: {data.address.subdistrict}</p>
                    <p>Kabupaten: {data.address.city}</p>
                </CardContent>
            </Card>

            {/* ITEMS */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {data.items.map((item, i) => (
                        <div
                            key={i}
                            className="flex justify-between border rounded-md p-3"
                        >
                            <div>
                                <p className="font-semibold">
                                    {item.product}
                                </p>
                                <p className="text-muted-foreground">
                                    Warna: {item.color} | Size: {item.size}
                                </p>
                            </div>
                            <div className="font-medium">
                                Rp {item.price.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* SUMMARY */}
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <Summary
                        label="Total Item"
                        value={`${data.items.length} Item`}
                    />
                    <Summary
                        label="Harga Total"
                        value={`Rp ${totalPrice.toLocaleString()}`}
                    />
                    <Separator />
                    <Summary
                        label="Sisa Tanggungan"
                        value={`Rp ${data.remaining.toLocaleString()}`}
                        highlight
                    />
                </CardContent>
            </Card>
        </div>
    )
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}

function Summary({ label, value, highlight }) {
    return (
        <div className="flex justify-between">
            <span>{label}</span>
            <span
                className={`font-semibold ${
                    highlight ? "text-red-600" : ""
                }`}
            >
                {value}
            </span>
        </div>
    )
}
