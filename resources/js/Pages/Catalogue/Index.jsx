import AppLayout from "@/Layouts/AppLayout";
import CatalogueTable from "./Partials/CatalogueTable";
import CreateCatalogueModal from "./CreateCatalogueModal";
import { useState, useEffect } from "react";

export default function CatalogueIndex() {
    const [openCreate, setOpenCreate] = useState(false);

    useEffect(() => {
        const handleOpenCreate = () => {
            setOpenCreate(true);
        };

        window.addEventListener("openCreateModal", handleOpenCreate);
        return () => {
            window.removeEventListener("openCreateModal", handleOpenCreate);
        };
    }, []);

    return (
        <div className="space-y-4">
            <CatalogueTable />
            <CreateCatalogueModal open={openCreate} setOpen={setOpenCreate} />
        </div>
    );
}

CatalogueIndex.layout = (page) => (
    <AppLayout title="Catalogue">{page}</AppLayout>
);
