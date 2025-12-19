import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { router } from "@inertiajs/react"
import EditCatalogueModal from "../EditCatalogueModal"

export default function CatalogueTableRow({ item }) {
    const [openEdit, setOpenEdit] = useState(false)

    const handleEditClick = e => {
        e.stopPropagation()
        setOpenEdit(true)
    }

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.visit(`/catalogue/${item.id}`)}
            >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.gender}</TableCell>
                <TableCell>{item.material}</TableCell>

                <TableCell>
                    Rp {item.cashPrice.toLocaleString("id-ID")}
                </TableCell>

                <TableCell className="font-semibold">
                    Rp {item.creditPrice.toLocaleString("id-ID")}
                </TableCell>

                <TableCell>
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                    />
                </TableCell>

                {/* Actions */}
                <TableCell>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={handleEditClick}
                        className="text-yellow-500"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                </TableCell>
            </TableRow>

            {/* Edit Modal */}
            <EditCatalogueModal
                open={openEdit}
                setOpen={setOpenEdit}
                data={item}
            />
        </>
    )
}
