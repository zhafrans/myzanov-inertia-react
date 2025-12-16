export default function SalesPagination({
    page,
    setPage,
    total,
    perPage,
}) {
    const totalPages = Math.ceil(total / perPage)

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
                Menampilkan {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, total)} dari {total}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
