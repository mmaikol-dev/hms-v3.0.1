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
import { Plus, Search, Edit, Trash, Loader2, Building2, Eye, Bed } from "lucide-react";
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
    { title: "Wards", href: "/wards" },
];

const wardTypes = [
    { value: "general", label: "General" },
    { value: "private", label: "Private" },
    { value: "icu", label: "ICU" },
    { value: "emergency", label: "Emergency" },
    { value: "maternity", label: "Maternity" },
    { value: "pediatric", label: "Pediatric" },
];

const typeColors = {
    general: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    private: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    icu: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    emergency: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    maternity: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    pediatric: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};

export default function WardsIndex() {
    const { wards, departments } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingWard, setEditingWard] = useState<any>(null);

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingWard, setViewingWard] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/wards",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (ward: any) => {
        setEditingWard({ ...ward });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingWard) return;

        setProcessing(true);

        router.put(`/wards/${editingWard.id}`, editingWard, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewWard = (ward: any) => {
        setViewingWard(ward);
        setOpenView(true);
    };

    const toggleActive = (ward: any) => {
        router.put(`/wards/${ward.id}`, {
            ...ward,
            is_active: !ward.is_active
        }, {
            preserveScroll: true,
        });
    };

    const getOccupancyRate = (ward: any) => {
        if (!ward.beds_count || ward.total_beds === 0) return 0;
        const occupied = ward.beds?.filter((b: any) => b.status === 'occupied').length || 0;
        return Math.round((occupied / ward.total_beds) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wards" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Wards Management</h1>

                    <Link href="/wards/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Ward
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search ward name or type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!wards ? (
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
                                    <TableHead>Ward Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Floor</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Beds</TableHead>
                                    <TableHead>Occupancy</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {wards.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-4"
                                        >
                                            No wards found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    wards.data.map((ward: any) => (
                                        <TableRow key={ward.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Building2 className="text-primary" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {ward.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[ward.type as keyof typeof typeColors]
                                                        }`}
                                                >
                                                    {ward.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    Floor {ward.floor_number}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {ward.department?.name || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Bed size={14} className="text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {ward.beds_count || 0} / {ward.total_beds}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{
                                                                width: `${getOccupancyRate(ward)}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium">
                                                        {getOccupancyRate(ward)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => toggleActive(ward)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${ward.is_active
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                        }`}
                                                >
                                                    {ward.is_active ? "Active" : "Inactive"}
                                                </button>
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* VIEW */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewWard(ward)}
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                {/* BEDS */}
                                                <Link href={`/beds?ward_id=${ward.id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Bed size={16} />
                                                    </Button>
                                                </Link>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(ward)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(`/wards/${ward.id}`)
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
                {wards && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {wards.from} to {wards.to} of{" "}
                            {wards.total}
                        </div>

                        <div className="flex gap-2">
                            {wards.links.map((link: any, i: number) => (
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
                        <DialogTitle>Edit Ward</DialogTitle>
                    </DialogHeader>

                    {editingWard && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Ward Name</Label>
                                <Input
                                    value={editingWard.name}
                                    onChange={(e) =>
                                        setEditingWard({
                                            ...editingWard,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Ward Type</Label>
                                <Select
                                    value={editingWard.type}
                                    onValueChange={(value) =>
                                        setEditingWard({
                                            ...editingWard,
                                            type: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wardTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Floor Number</Label>
                                <Input
                                    type="number"
                                    value={editingWard.floor_number}
                                    onChange={(e) =>
                                        setEditingWard({
                                            ...editingWard,
                                            floor_number: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Total Beds</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={editingWard.total_beds}
                                    onChange={(e) =>
                                        setEditingWard({
                                            ...editingWard,
                                            total_beds: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Department</Label>
                                <Select
                                    value={editingWard.department_id?.toString() || ""}
                                    onValueChange={(value) =>
                                        setEditingWard({
                                            ...editingWard,
                                            department_id: value ? parseInt(value) : null,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {departments?.map((dept: any) => (
                                            <SelectItem
                                                key={dept.id}
                                                value={dept.id.toString()}
                                            >
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editingWard.is_active}
                                    onChange={(e) =>
                                        setEditingWard({
                                            ...editingWard,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active Status
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ward Details</DialogTitle>
                    </DialogHeader>

                    {viewingWard && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Ward Name
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingWard.name}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Type
                                    </h3>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColors[viewingWard.type as keyof typeof typeColors]
                                            }`}
                                    >
                                        {viewingWard.type}
                                    </span>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Floor Number
                                    </h3>
                                    <p className="font-semibold">
                                        Floor {viewingWard.floor_number}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Total Beds
                                    </h3>
                                    <p className="font-semibold text-lg">
                                        {viewingWard.total_beds}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Department
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingWard.department?.name || "Not assigned"}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Status
                                    </h3>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${viewingWard.is_active
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                                            }`}
                                    >
                                        {viewingWard.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Occupancy Rate
                                    </h3>
                                    <p className="font-semibold text-lg">
                                        {getOccupancyRate(viewingWard)}%
                                    </p>
                                </div>
                            </div>

                            {viewingWard.beds && viewingWard.beds.length > 0 && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Beds Overview</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {viewingWard.beds.map((bed: any) => (
                                            <div
                                                key={bed.id}
                                                className={`p-2 rounded text-center text-xs ${bed.status === 'occupied'
                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                        : bed.status === 'available'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                    }`}
                                            >
                                                {bed.bed_number}
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