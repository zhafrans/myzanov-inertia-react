export default function PerformanceSummary({ performance }) {
    if (!performance) return null;

    const totalCard = performance.lunas.count + performance.belumLunas.count

    const percent = v =>
        totalCard > 0 ? ((v / totalCard) * 100).toFixed(1) : 0

    return (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
            <Summary label="Produk Terjual" value={performance.totalProduct || 0} />

            <Summary
                label="Kartu Lunas"
                value={`${performance.lunas.count} (${percent(performance.lunas.count)}%)`}
                success
            />

            <Summary
                label="Belum Lunas"
                value={`${performance.belumLunas.count} (${percent(performance.belumLunas.count)}%)`}
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
