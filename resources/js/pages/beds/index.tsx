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
import { Plus, Search, Edit, Trash, Loader2, Bed, Eye, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Beds", href: "/beds" },
];

const statusOptions = [
    { value: "available", label: "Available" },
    { value: "occupied", label: "Occupied" },
    { value: "maintenance", label: "Maintenance" },
    { value: "reserved", label: "Reserved" },
];

const statusColors = {
    available: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    occupied: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    maintenance: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    reserved: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};

export default function BedsIndex() {
    const { beds, wards } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [filterWard, setFilterWard] = useState("all");
    const [filterStatus, setFilterStatus] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingBed, setEditingBed] = useState<any>(null);

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingBed, setViewingBed] = useState<any>(null);

    const handleSearch = () => {
        router.get("/beds", {
            search,
            ward_id: filterWard === "all" ? "" : filterWard,
            status: filterStatus === "all" ? "" : filterStatus,
        });

    };

    const openEditModal = (bed: any) => {
        setEditingBed({ ...bed });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingBed) return;

        setProcessing(true);

        router.put(`/beds/${editingBed.id}`, editingBed, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewBed = (bed: any) => {
        setViewingBed(bed);
        setOpenView(true);
    };

    const updateStatus = (bed: any, newStatus: string) => {
        router.put(`/beds/${bed.id}`, {
            ...bed,
            status: newStatus
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beds" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Beds Management</h1>

                    <Link href="/beds/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Bed
                        </Button>
                    </Link>
                </div>

                {/* FILTERS */}
                <div className="flex gap-2 flex-wrap">
                    <Input
                        placeholder="Search bed number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />

                    <Select value={filterWard} onValueChange={setFilterWard}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by Ward" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Wards</SelectItem>

                            {wards?.map((ward: any) => (
                                <SelectItem key={ward.id} value={ward.id.toString()}>
                                    {ward.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>

                            {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                        <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
                            Available
                        </h3>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {beds?.data?.filter((b: any) => b.status === 'available').length || 0}
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                        <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                            Occupied
                        </h3>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {beds?.data?.filter((b: any) => b.status === 'occupied').length || 0}
                        </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900">
                        <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            Maintenance
                        </h3>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {beds?.data?.filter((b: any) => b.status === 'maintenance').length || 0}
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Reserved
                        </h3>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {beds?.data?.filter((b: any) => b.status === 'reserved').length || 0}
                        </p>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!beds ? (
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
                                    <TableHead>Bed Number</TableHead>
                                    <TableHead>Ward</TableHead>
                                    <TableHead>Floor</TableHead>
                                    <TableHead>Charge/Day</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Current Patient</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {beds.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No beds found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    beds.data.map((bed: any) => (
                                        <TableRow key={bed.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Bed className="text-primary" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium font-mono">
                                                            {bed.bed_number}
                                                        </div>
                                                        {bed.description && (
                                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                                {bed.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {bed.ward?.name || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {bed.ward?.type}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                Floor {bed.ward?.floor_number || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">
                                                    ${bed.charge_per_day}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    /day
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={bed.status}
                                                    onValueChange={(value) =>
                                                        updateStatus(bed, value)
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className={`w-32 h-7 text-xs ${statusColors[
                                                            bed.status as keyof typeof statusColors
                                                        ]
                                                            }`}
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((status) => (
                                                            <SelectItem
                                                                key={status.value}
                                                                value={status.value}
                                                            >
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {bed.current_admission ? (
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {bed.current_admission.patient?.user?.name || "N/A"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* VIEW */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewBed(bed)}
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(bed)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(`/beds/${bed.id}`)
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
                {beds && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {beds.from} to {beds.to} of{" "}
                            {beds.total}
                        </div>

                        <div className="flex gap-2">
                            {beds.links.map((link: any, i: number) => (
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
                        <DialogTitle>Edit Bed</DialogTitle>
                    </DialogHeader>

                    {editingBed && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Bed Number</Label>
                                <Input
                                    value={editingBed.bed_number}
                                    onChange={(e) =>
                                        setEditingBed({
                                            ...editingBed,
                                            bed_number: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={editingBed.status}
                                    onValueChange={(value) =>
                                        setEditingBed({
                                            ...editingBed,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Charge Per Day ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingBed.charge_per_day}
                                    onChange={(e) =>
                                        setEditingBed({
                                            ...editingBed,
                                            charge_per_day: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingBed.description ?? ""}
                                    onChange={(e) =>
                                        setEditingBed({
                                            ...editingBed,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bed Details</DialogTitle>
                    </DialogHeader>

                    {viewingBed && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Bed Number
                                    </h3>
                                    <p className="font-mono font-semibold text-lg">
                                        {viewingBed.bed_number}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Status
                                    </h3>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[
                                            viewingBed.status as keyof typeof statusColors
                                        ]
                                            }`}
                                    >
                                        {viewingBed.status}
                                    </span>
                                </div>

                                <div className="p-4 bg-muted rounded-lg col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Ward
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingBed.ward?.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingBed.ward?.type} - Floor {viewingBed.ward?.floor_number}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Charge Per Day
                                    </h3>
                                    <p className="font-semibold text-lg">
                                        ${viewingBed.charge_per_day}
                                    </p>
                                </div>

                                {viewingBed.current_admission && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Current Patient
                                        </h3>
                                        <p className="font-semibold">
                                            {viewingBed.current_admission.patient?.user?.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {viewingBed.description && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingBed.description}
                                    </p>
                                </div>
                            )}

                            {viewingBed.admissions && viewingBed.admissions.length > 0 && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">
                                        Recent Admissions
                                    </h3>
                                    <div className="space-y-2">
                                        {viewingBed.admissions.slice(0, 5).map((admission: any) => (
                                            <div
                                                key={admission.id}
                                                className="p-3 bg-background rounded text-sm"
                                            >
                                                <div className="font-medium">
                                                    {admission.patient?.user?.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Status: {admission.status}
                                                </div>
                                            </div>
                                        ))}
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