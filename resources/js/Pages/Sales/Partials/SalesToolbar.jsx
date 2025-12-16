import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload, Download, Filter } from "lucide-react"
import CreateModal from "../CreateModal"
import ImportModal from "../ImportModal"

export default function SalesToolbar() {
    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
                <CreateModal />
                <ImportModal />
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>
        </div>
    )
}
