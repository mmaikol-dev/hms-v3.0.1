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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    Edit,
    Trash,
    Building2,
    Users,
    Loader2,
    Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Departments", href: "/departments" },
];

export default function DepartmentsIndex() {
    const { departments } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<any>(null);

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingDepartment, setViewingDepartment] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/departments",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (department: any) => {
        setEditingDepartment({ ...department });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingDepartment) return;

        setProcessing(true);

        router.put(`/departments/${editingDepartment.id}`, editingDepartment, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewDepartment = async (department: any) => {
        // Fetch full department details
        try {
            const response = await fetch(`/departments/${department.id}`);
            const data = await response.json();
            setViewingDepartment(data);
            setOpenView(true);
        } catch (error) {
            console.error("Error fetching department:", error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Departments</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage hospital departments and their staff
                        </p>
                    </div>

                    <Link href="/departments/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Department
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search departments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!departments ? (
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
                                    <TableHead>Department</TableHead>
                                    <TableHead>Head of Department</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Doctors</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {departments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-4"
                                        >
                                            No departments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    departments.data.map((dept: any) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Building2
                                                            className="text-primary"
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {dept.name}
                                                        </div>
                                                        {dept.description && (
                                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                                {
                                                                    dept.description
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {dept.head_of_department ||
                                                    "—"}
                                            </TableCell>
                                            <TableCell>
                                                {dept.phone || "—"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    <span>
                                                        {dept.doctors_count || 0}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        dept.is_active
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {dept.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </Badge>
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* VIEW */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        viewDepartment(dept)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEditModal(dept)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/departments/${dept.id}`
                                                        )
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
                {departments && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {departments.from} to {departments.to} of{" "}
                            {departments.total}
                        </div>

                        <div className="flex gap-2">
                            {departments.links.map((link: any, i: number) => (
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
                        <DialogTitle>Edit Department</DialogTitle>
                    </DialogHeader>

                    {editingDepartment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="md:col-span-2">
                                <Label>Department Name</Label>
                                <Input
                                    value={editingDepartment.name}
                                    onChange={(e) =>
                                        setEditingDepartment({
                                            ...editingDepartment,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Head of Department</Label>
                                <Input
                                    value={
                                        editingDepartment.head_of_department ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        setEditingDepartment({
                                            ...editingDepartment,
                                            head_of_department: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={editingDepartment.phone ?? ""}
                                    onChange={(e) =>
                                        setEditingDepartment({
                                            ...editingDepartment,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={
                                        editingDepartment.description ?? ""
                                    }
                                    onChange={(e) =>
                                        setEditingDepartment({
                                            ...editingDepartment,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-3">
                                <Switch
                                    checked={editingDepartment.is_active}
                                    onCheckedChange={(checked) =>
                                        setEditingDepartment({
                                            ...editingDepartment,
                                            is_active: checked,
                                        })
                                    }
                                />
                                <Label className="mb-0">
                                    Department is Active
                                </Label>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2
                                    className="mr-2 animate-spin"
                                    size={16}
                                />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===========================
                VIEW MODAL
            ============================ */}
            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Department Details</DialogTitle>
                    </DialogHeader>

                    {viewingDepartment && (
                        <div className="space-y-6 mt-4">
                            {/* Basic Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2
                                            className="text-primary"
                                            size={24}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {viewingDepartment.name}
                                        </h3>
                                        <Badge
                                            variant={
                                                viewingDepartment.is_active
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {viewingDepartment.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                {viewingDepartment.description && (
                                    <p className="text-muted-foreground">
                                        {viewingDepartment.description}
                                    </p>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <Label className="text-muted-foreground">
                                        Head of Department
                                    </Label>
                                    <p className="font-medium">
                                        {viewingDepartment.head_of_department ||
                                            "—"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Phone
                                    </Label>
                                    <p className="font-medium">
                                        {viewingDepartment.phone || "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-muted rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {viewingDepartment.doctors?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Doctors
                                    </div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {viewingDepartment.users?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Staff
                                    </div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {viewingDepartment.wards?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Wards
                                    </div>
                                </div>
                            </div>

                            {/* Doctors List */}
                            {viewingDepartment.doctors &&
                                viewingDepartment.doctors.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">
                                            Doctors
                                        </h4>
                                        <div className="space-y-2">
                                            {viewingDepartment.doctors.map(
                                                (doctor: any) => (
                                                    <div
                                                        key={doctor.id}
                                                        className="p-3 bg-muted rounded-lg flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <div className="font-medium">
                                                                {doctor.user
                                                                    ?.name ||
                                                                    "N/A"}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {
                                                                    doctor.specialization
                                                                }
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/doctors/${doctor.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenView(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}