import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

export default function UserFormModal({ open, setOpen, user }) {
    const isEdit = Boolean(user)

    const [form, setForm] = useState({
        username: "",
        password: "",
        confirm: "",
        role: "",
    })

    useEffect(() => {
        if (user) {
            setForm({
                username: user.username,
                password: "",
                confirm: "",
                role: user.role,
            })
        }
    }, [user])

    const handleSubmit = e => {
        e.preventDefault()
        console.log("SUBMIT:", form)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit User" : "Tambah User"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Username"
                        value={form.username}
                        onChange={e =>
                            setForm({ ...form, username: e.target.value })
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirm}
                        onChange={e =>
                            setForm({ ...form, confirm: e.target.value })
                        }
                    />

                    <Select
                        value={form.role}
                        onValueChange={v =>
                            setForm({ ...form, role: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Hak Akses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="collector">Collector</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit">
                            Simpan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
