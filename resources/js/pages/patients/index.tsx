"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash, User2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Patients", href: "/patients" },
];

export default function PatientsIndex() {
    const { patients } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingPatient, setEditingPatient] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/patients",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (patient: any) => {
        setEditingPatient({ ...patient });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingPatient) return;

        setProcessing(true);

        router.put(`/patients/${editingPatient.id}`, editingPatient, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Patients</h1>

                    <Link href="/patients/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Patient
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search patient name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!patients ? (
                        // LOADING STATE
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Last Visit</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {patients.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-4"
                                        >
                                            No patients found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    patients.data.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                {p.first_name} {p.last_name}
                                            </TableCell>
                                            <TableCell>{p.phone}</TableCell>
                                            <TableCell>{p.gender}</TableCell>
                                            <TableCell>
                                                {p.last_visit ?? "—"}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">

                                                {/* PROFILE */}
                                                <Link href={`/patients/${p.id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="flex items-center gap-1"
                                                    >
                                                        <User2 size={16} />
                                                    </Button>
                                                </Link>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(p)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(`/patients/${p.id}`)
                                                    }
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* PAGINATION */}
                {patients && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {patients.from} to {patients.to} of{" "}
                            {patients.total}
                        </div>

                        <div className="flex gap-2">
                            {patients.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    className={`px-3 py-1 rounded-md border ${link.active
                                        ? "bg-primary text-white"
                                        : "bg-background text-foreground"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                EDIT MODAL
            ============================ */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Patient</DialogTitle>
                    </DialogHeader>

                    {editingPatient && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>First Name</Label>
                                <Input
                                    value={editingPatient.first_name}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            first_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Last Name</Label>
                                <Input
                                    value={editingPatient.last_name}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            last_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={editingPatient.phone}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Email</Label>
                                <Input
                                    value={editingPatient.email ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Gender</Label>
                                <Input
                                    value={editingPatient.gender}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            gender: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>ID Number</Label>
                                <Input
                                    value={editingPatient.id_number ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            id_number: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Address</Label>
                                <Input
                                    value={editingPatient.address ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            address: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 animate-spin" size={16} />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


        </AppLayout>
    );
}
