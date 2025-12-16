import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CreateModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Data
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Tambah Sales</DialogTitle>
                </DialogHeader>

                {/* form nanti */}
                <p className="text-sm text-muted-foreground">
                    Form input sales (dummy)
                </p>
            </DialogContent>
        </Dialog>
    )
}
