// Users Create Page (UsersCreate.tsx)
// --------------------------------------------------
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type BreadcrumbItem } from "@/types";

const createBreadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Users", href: "/users" },
    { title: "Add User", href: "/users/create" },
];

export default function UsersCreate() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        address: "",
        is_active: true,
    });

    const submit = () => {
        router.post("/users", form);
    };

    return (
        <AppLayout breadcrumbs={createBreadcrumbs}>
            <Head title="Add User" />

            <div className="p-4 max-w-3xl mx-auto space-y-6">
                <h1 className="text-xl font-semibold">Create User</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>

                    <div>
                        <Label>Phone</Label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>

                    <div>
                        <Label>Password</Label>
                        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>

                    <div>
                        <Label>Role</Label>
                        <Select onValueChange={(value) => setForm({ ...form, role: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="receptionist">Receptionist</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-2">
                        <Label>Address</Label>
                        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>

                    <div>
                        <Label>Status</Label>
                        <Select onValueChange={(value) => setForm({ ...form, is_active: value === "active" })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <Link href="/users">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={submit}>Save User</Button>
                </div>
            </div>
        </AppLayout>
    );
}