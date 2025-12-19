import AppLayout from "@/Layouts/AppLayout"
import CatalogueTable from "./Partials/CatalogueTable"

export default function CatalogueIndex() {
    return (
        <div className="space-y-4">
            <CatalogueTable />
        </div>
    )
}

CatalogueIndex.layout = page => (
    <AppLayout title="Catalogue">
        {page}
    </AppLayout>
)
