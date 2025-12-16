import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Pencil, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import UserFormModal from "./UserFormModal"
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const dummyUsers = [
    { id: 1, username: "admin", role: "admin" },
    { id: 2, username: "umi", role: "sales" },
    { id: 3, username: "bihan", role: "collector" },
]

export default function UsersTable() {
    const [openForm, setOpenForm] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    const handleCreate = () => {
        setSelectedUser(null)
        setOpenForm(true)
    }

    const handleEdit = user => {
        setSelectedUser(user)
        setOpenForm(true)
    }

    const handleDeleteClick = user => {
        setSelectedUser(user)
        setOpenDelete(true)
    }

    const handleDeleteConfirm = () => {
        console.log("DELETE USER:", selectedUser)
        setOpenDelete(false)
    }

    return (
        <>
            {/* TOOLBAR */}
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah User
                </Button>
            </div>

            {/* TABLE */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profile</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Hak Akses</TableHead>
                            <TableHead className="w-32">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {dummyUsers.map(user => (
                            <TableRow
                                key={user.id}
                                className="cursor-pointer hover:bg-muted"
                                onClick={() =>
                                    router.visit(`/users/${user.id}`)
                                }
                            >
                                <TableCell>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {user.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>

                                <TableCell className="font-medium">
                                    {user.username}
                                </TableCell>

                                <TableCell className="capitalize">
                                    {user.role}
                                </TableCell>

                                <TableCell>
                                    <div
                                        className="flex gap-2"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() =>
                                                handleEdit(user)
                                            }
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDeleteClick(user)
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* CREATE / EDIT MODAL */}
            <UserFormModal
                open={openForm}
                setOpen={setOpenForm}
                user={selectedUser}
            />

            {/* DELETE CONFIRM MODAL */}
            <ConfirmDeleteModal
                open={openDelete}
                setOpen={setOpenDelete}
                title="Hapus User"
                description={`Yakin ingin menghapus user "${selectedUser?.username}"?`}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}
