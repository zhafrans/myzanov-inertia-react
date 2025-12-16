import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function ImportModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Data Sales</DialogTitle>
                </DialogHeader>

                <input type="file" />
            </DialogContent>
        </Dialog>
    )
}
