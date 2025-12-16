const data = {
    totalProduct: 120,
    lunas: { count: 80, amount: 12000000 },
    belumLunas: { count: 40, amount: 5000000 },
}

export default function PerformanceSummary() {
    const totalCard = data.lunas.count + data.belumLunas.count

    const percent = v =>
        ((v / totalCard) * 100).toFixed(1)

    return (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
            <Summary label="Produk Terjual" value={data.totalProduct} />

            <Summary
                label="Kartu Lunas"
                value={`${data.lunas.count} (${percent(data.lunas.count)}%)`}
                sub={`Rp ${data.lunas.amount.toLocaleString()}`}
                success
            />

            <Summary
                label="Belum Lunas"
                value={`${data.belumLunas.count} (${percent(data.belumLunas.count)}%)`}
                sub={`Rp ${data.belumLunas.amount.toLocaleString()}`}
                danger
            />
        </div>
    )
}

function Summary({ label, value, sub, success, danger }) {
    return (
        <div className="border rounded-lg p-4">
            <p className="text-muted-foreground">{label}</p>
            <p
                className={`text-lg font-bold ${
                    success
                        ? "text-green-600"
                        : danger
                        ? "text-red-600"
                        : ""
                }`}
            >
                {value}
            </p>
            {sub && (
                <p className="text-sm text-muted-foreground">{sub}</p>
            )}
        </div>
    )
}
