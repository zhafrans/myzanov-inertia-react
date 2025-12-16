import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, FilePlus } from "lucide-react"
import { useState } from "react"
import { router } from "@inertiajs/react"
import EditSalesModal from "../EditSalesModal"
import InputInstallmentModal from "../InputInstallmentModal"

export default function SalesTableRow({ item }) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openTagihan, setOpenTagihan] = useState(false)

    const handleEditClick = e => {
        e.stopPropagation() // supaya tidak trigger router.visit
        setOpenEdit(true)
    }

    const handleTagihanClick = e => {
        e.stopPropagation()
        setOpenTagihan(true)
    }

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.visit(`/sales/${item.id}`)}
            >
                <TableCell>{item.cardNo}</TableCell>
                <TableCell>{item.sales}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.address}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                <TableCell className="font-semibold text-red-600">
                    Rp {item.remaining.toLocaleString()}
                </TableCell>

                {/* Actions */}
                <TableCell className="flex gap-2">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={handleEditClick}
                        className="text-yellow-500"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleTagihanClick}
                        className="text-blue-500"
                    >
                        <FilePlus className="w-4 h-4" />
                    </Button>
                </TableCell>
            </TableRow>

            {/* Edit Modal */}
            <EditSalesModal
                open={openEdit}
                setOpen={setOpenEdit}
                data={item}
            />

            {/* Input Tagihan Modal */}
            <InputInstallmentModal
                open={openTagihan}
                setOpen={setOpenTagihan}
                salesId={item.id}
            />
        </>
    )
}
