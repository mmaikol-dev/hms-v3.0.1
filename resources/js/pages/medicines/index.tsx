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
import { Plus, Search, Edit, Trash, AlertCircle, Package, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Medicines", href: "/medicines" },
];

const categories = [
    "Antibiotic",
    "Painkiller",
    "Antipyretic",
    "Antiviral",
    "Antifungal",
    "Antihistamine",
    "Cardiovascular",
    "Gastrointestinal",
    "Respiratory",
    "Other"
];

const dosageForms = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Cream",
    "Ointment",
    "Drops",
    "Inhaler",
    "Suppository"
];

export default function MedicinesIndex() {
    const { medicines } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<any>(null);
    const [openStock, setOpenStock] = useState(false);
    const [stockMedicine, setStockMedicine] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/medicines",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (medicine: any) => {
        setEditingMedicine({ ...medicine });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingMedicine) return;

        setProcessing(true);

        router.put(`/medicines/${editingMedicine.id}`, editingMedicine, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewStockDetails = (medicine: any) => {
        setStockMedicine(medicine);
        setOpenStock(true);
    };

    const isLowStock = (medicine: any) => {
        return medicine.quantity_in_stock <= medicine.reorder_level;
    };

    const isExpiringSoon = (expiryDate: string) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        return expiry <= threeMonthsFromNow;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medicines" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Medicines Inventory</h1>

                    <Link href="/medicines/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Medicine
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search by name, generic name, or brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!medicines ? (
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
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Dosage Form</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {medicines.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No medicines found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    medicines.data.map((m: any) => (
                                        <TableRow key={m.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Package className="text-primary" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {m.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {m.generic_name || "N/A"}
                                                        </div>
                                                        {m.brand && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Brand: {m.brand}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{m.category}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {m.dosage_form || "N/A"}
                                                </div>
                                                {m.strength && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {m.strength}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={isLowStock(m) ? "text-red-500 font-semibold" : ""}>
                                                        {m.quantity_in_stock}
                                                    </span>
                                                    {isLowStock(m) && (
                                                        <AlertCircle className="text-red-500" size={16} />
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Reorder: {m.reorder_level}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                ${m.unit_price}
                                            </TableCell>
                                            <TableCell>
                                                {m.expiry_date ? (
                                                    <div>
                                                        <div className={isExpiringSoon(m.expiry_date) ? "text-orange-500 font-semibold" : ""}>
                                                            {new Date(m.expiry_date).toLocaleDateString()}
                                                        </div>
                                                        {isExpiringSoon(m.expiry_date) && (
                                                            <Badge variant="outline" className="text-orange-500 border-orange-500 text-xs mt-1">
                                                                Expiring Soon
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </TableCell>

                                            <TableCell className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewStockDetails(m)}
                                                >
                                                    <Package size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(m)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(`/medicines/${m.id}`)
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
                {medicines && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {medicines.from} to {medicines.to} of{" "}
                            {medicines.total}
                        </div>

                        <div className="flex gap-2">
                            {medicines.links.map((link: any, i: number) => (
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

            {/* EDIT MODAL */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Medicine</DialogTitle>
                    </DialogHeader>

                    {editingMedicine && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Medicine Name *</Label>
                                <Input
                                    value={editingMedicine.name}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Generic Name</Label>
                                <Input
                                    value={editingMedicine.generic_name || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            generic_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Brand</Label>
                                <Input
                                    value={editingMedicine.brand || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            brand: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Category *</Label>
                                <Input
                                    value={editingMedicine.category}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            category: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Manufacturer</Label>
                                <Input
                                    value={editingMedicine.manufacturer || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            manufacturer: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Dosage Form</Label>
                                <Input
                                    value={editingMedicine.dosage_form || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            dosage_form: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Strength</Label>
                                <Input
                                    value={editingMedicine.strength || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            strength: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., 500mg"
                                />
                            </div>

                            <div>
                                <Label>Unit Price *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingMedicine.unit_price}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            unit_price: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Quantity in Stock *</Label>
                                <Input
                                    type="number"
                                    value={editingMedicine.quantity_in_stock}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            quantity_in_stock: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Reorder Level *</Label>
                                <Input
                                    type="number"
                                    value={editingMedicine.reorder_level}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            reorder_level: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={editingMedicine.expiry_date || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
                                            expiry_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingMedicine.description || ""}
                                    onChange={(e) =>
                                        setEditingMedicine({
                                            ...editingMedicine,
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

            {/* STOCK DETAILS MODAL */}
            <Dialog open={openStock} onOpenChange={setOpenStock}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Stock Details - {stockMedicine?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {stockMedicine && (
                        <div className="space-y-4 mt-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Current Stock Level
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {stockMedicine.quantity_in_stock}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Units Available
                                        </p>
                                    </div>
                                    {isLowStock(stockMedicine) && (
                                        <Badge variant="destructive">
                                            Low Stock
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Reorder Information
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Reorder Level: {stockMedicine.reorder_level}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Unit Cost: ${stockMedicine.unit_price}
                                </p>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Product Details
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Generic:</span> {stockMedicine.generic_name || "N/A"}</p>
                                    <p><span className="font-medium">Brand:</span> {stockMedicine.brand || "N/A"}</p>
                                    <p><span className="font-medium">Manufacturer:</span> {stockMedicine.manufacturer || "N/A"}</p>
                                    <p><span className="font-medium">Dosage Form:</span> {stockMedicine.dosage_form || "N/A"}</p>
                                    <p><span className="font-medium">Strength:</span> {stockMedicine.strength || "N/A"}</p>
                                </div>
                            </div>

                            {stockMedicine.expiry_date && (
                                <div className={`p-4 rounded-lg ${isExpiringSoon(stockMedicine.expiry_date) ? "bg-orange-50 dark:bg-orange-950" : "bg-muted"}`}>
                                    <h3 className="font-semibold mb-2">
                                        Expiry Information
                                    </h3>
                                    <p className="text-sm">
                                        Expires: {new Date(stockMedicine.expiry_date).toLocaleDateString()}
                                    </p>
                                    {isExpiringSoon(stockMedicine.expiry_date) && (
                                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                            ⚠️ This medicine is expiring within 3 months
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenStock(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}