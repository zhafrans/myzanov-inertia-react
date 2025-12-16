import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function ConfirmDeleteModal({
    open,
    setOpen,
    title = "Hapus Data",
    description = "Apakah Anda yakin ingin menghapus data ini?",
    onConfirm,
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    {description}
                </p>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm()
                            setOpen(false)
                        }}
                    >
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
