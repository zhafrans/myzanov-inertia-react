import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { usePage } from "@inertiajs/react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Pencil,
    Trash2,
    Plus,
    Search,
    Filter,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import CreateUserModal from "./Modals/CreateUserModal";
import EditUserModal from "./Modals/EditUserModal";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UsersTable({ users, filters = {}, sort = {} }) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || "",
        role: filters.role || "",
        is_active: filters.is_active ?? "",
    });

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            const serverSearch = filters.search || "";
            const localSearch = localFilters.search || "";

            if (serverSearch !== localSearch) {
                const final = {
                    ...filters,
                    ...localFilters,
                    search: localSearch,
                };

                // Clean up empty values
                if (!final.search) delete final.search;
                if (!final.role) delete final.role;
                if (final.is_active === "" || final.is_active === undefined)
                    delete final.is_active;

                setLoading(true);

                router.get(route("users.index"), final, {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setLoading(false),
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localFilters.search]);

    const handleCreate = () => {
        setOpenCreateModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenEditModal(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setOpenDelete(true);
    };

    const handleDeleteConfirm = () => {
        router.delete(route("users.destroy", selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false);
                setSelectedUser(null);
            },
        });
    };

    const handleFilterChange = (key, value) => {
        let newValue = value;
        if ((key === "role" || key === "is_active") && value === "all") {
            newValue = "";
        }

        const newFilters = { ...localFilters, [key]: newValue };
        setLocalFilters(newFilters);

        // If it's search, let the useEffect handle it (debounced)
        if (key === "search") return;

        // For other filters, trigger immediately
        const final = {
            ...filters,
            ...newFilters,
        };

        if (!final.search) delete final.search;
        if (!final.role) delete final.role;
        if (final.is_active === "" || final.is_active === undefined)
            delete final.is_active;

        setLoading(true);

        router.get(route("users.index"), final, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleSort = (field) => {
        router.get(
            route("users.index"),
            {
                ...filters,
                sort: field,
                direction:
                    sort.field === field && sort.direction === "asc"
                        ? "desc"
                        : "asc",
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const SortIcon = ({ field }) => {
        if (sort.field !== field) return null;
        return sort.direction === "asc" ? (
            <ChevronUp className="w-4 h-4 ml-1" />
        ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
        );
    };

    return (
        <>
            {/* FILTER BAR */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Cari nama, email, atau telepon..."
                            className="pl-10"
                            value={localFilters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select
                        value={localFilters.role}
                        onValueChange={(value) =>
                            handleFilterChange("role", value)
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Role</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="collector">Collector</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={localFilters.is_active}
                        onValueChange={(value) =>
                            handleFilterChange("is_active", value)
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="1">Aktif</SelectItem>
                            <SelectItem value="0">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah User
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="relative border rounded-lg overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort("name")}
                            >
                                <div className="flex items-center">
                                    Nama
                                    <SortIcon field="name" />
                                </div>
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telepon</TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort("role")}
                            >
                                <div className="flex items-center">
                                    Role
                                    <SortIcon field="role" />
                                </div>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-32">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.data.length > 0 ? (
                            users.data.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {user.name[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {user.name}
                                                </div>
                                                {user.address && (
                                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                        {user.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>{user.email}</TableCell>

                                    <TableCell>{user.phone || "-"}</TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="capitalize"
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.is_active
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className={
                                                user.is_active
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : ""
                                            }
                                        >
                                            {user.is_active
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleDeleteClick(user)
                                                }
                                                disabled={
                                                    user.id === auth.user.id
                                                }
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    Tidak ada data user
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            {users.data.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {users.from} sampai {users.to} dari{" "}
                        {users.total} data
                    </div>
                    <div className="flex gap-2">
                        {(() => {
                            // Laravel pagination: first link is previous, last link is next
                            const prevLink = users.links[0];
                            const nextLink =
                                users.links[users.links.length - 1];

                            return (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!prevLink?.url}
                                        onClick={() =>
                                            prevLink?.url &&
                                            router.get(prevLink.url)
                                        }
                                        title="Sebelumnya"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!nextLink?.url}
                                        onClick={() =>
                                            nextLink?.url &&
                                            router.get(nextLink.url)
                                        }
                                        title="Selanjutnya"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* MODALS */}
            <CreateUserModal
                open={openCreateModal}
                setOpen={setOpenCreateModal}
            />

            <EditUserModal
                open={openEditModal}
                setOpen={setOpenEditModal}
                user={selectedUser}
            />

            <ConfirmDeleteModal
                open={openDelete}
                setOpen={setOpenDelete}
                title="Hapus User"
                description={`Yakin ingin menghapus user "${selectedUser?.name}"?`}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
