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
import { Plus, Search, Edit, Trash, AlertCircle, Box, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Inventory Items", href: "/inventoryitems" },
];

export default function InventoryItemsIndex() {
    const { items } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [detailsItem, setDetailsItem] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/inventoryitems",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (item: any) => {
        setEditingItem({ ...item });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingItem) return;

        setProcessing(true);

        router.put(`/inventoryitems/${editingItem.id}`, editingItem, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewItemDetails = (item: any) => {
        setDetailsItem(item);
        setOpenDetails(true);
    };

    const isLowStock = (item: any) => {
        return item.quantity_in_stock <= item.reorder_level;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Items" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Inventory Items</h1>

                    <Link href="/inventoryitems/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Item
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search by item name, code, or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!items ? (
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
                                    <TableHead>Item</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Unit Cost</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {items.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No inventory items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.data.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Box className="text-primary" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {item.item_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Code: {item.item_code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.unit_of_measure}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={isLowStock(item) ? "text-red-500 font-semibold" : ""}>
                                                        {item.quantity_in_stock}
                                                    </span>
                                                    {isLowStock(item) && (
                                                        <AlertCircle className="text-red-500" size={16} />
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Reorder: {item.reorder_level}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                ${item.unit_cost}
                                            </TableCell>
                                            <TableCell>
                                                {item.supplier || "N/A"}
                                            </TableCell>

                                            <TableCell className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewItemDetails(item)}
                                                >
                                                    <Box size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(item)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(`/inventoryitems/${item.id}`)
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
                {items && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {items.from} to {items.to} of{" "}
                            {items.total}
                        </div>

                        <div className="flex gap-2">
                            {items.links.map((link: any, i: number) => (
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
                        <DialogTitle>Edit Inventory Item</DialogTitle>
                    </DialogHeader>

                    {editingItem && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Item Name *</Label>
                                <Input
                                    value={editingItem.item_name}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            item_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Item Code *</Label>
                                <Input
                                    value={editingItem.item_code}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            item_code: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Category *</Label>
                                <Input
                                    value={editingItem.category}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            category: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Unit of Measure *</Label>
                                <Input
                                    value={editingItem.unit_of_measure}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            unit_of_measure: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., pieces, kg, liters"
                                />
                            </div>

                            <div>
                                <Label>Quantity in Stock *</Label>
                                <Input
                                    type="number"
                                    value={editingItem.quantity_in_stock}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            quantity_in_stock: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Reorder Level *</Label>
                                <Input
                                    type="number"
                                    value={editingItem.reorder_level}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            reorder_level: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Unit Cost *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingItem.unit_cost}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            unit_cost: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Supplier</Label>
                                <Input
                                    value={editingItem.supplier || ""}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            supplier: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Last Purchase Date</Label>
                                <Input
                                    type="date"
                                    value={editingItem.last_purchase_date || ""}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            last_purchase_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingItem.description || ""}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
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

            {/* ITEM DETAILS MODAL */}
            <Dialog open={openDetails} onOpenChange={setOpenDetails}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Item Details - {detailsItem?.item_name}
                        </DialogTitle>
                    </DialogHeader>

                    {detailsItem && (
                        <div className="space-y-4 mt-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Item Information
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Item Code:</span> {detailsItem.item_code}</p>
                                    <p><span className="font-medium">Category:</span> {detailsItem.category}</p>
                                    <p><span className="font-medium">Unit of Measure:</span> {detailsItem.unit_of_measure}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Stock Information
                                </h3>
                                <div className="flex items-center gap-4 mb-2">
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {detailsItem.quantity_in_stock}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Units Available
                                        </p>
                                    </div>
                                    {isLowStock(detailsItem) && (
                                        <Badge variant="destructive">
                                            Low Stock
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Reorder Level: {detailsItem.reorder_level}
                                </p>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Cost & Supplier
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Unit Cost:</span> ${detailsItem.unit_cost}</p>
                                    <p><span className="font-medium">Supplier:</span> {detailsItem.supplier || "N/A"}</p>
                                    {detailsItem.last_purchase_date && (
                                        <p><span className="font-medium">Last Purchase:</span> {new Date(detailsItem.last_purchase_date).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            {detailsItem.description && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">
                                        Description
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {detailsItem.description}
                                    </p>
                                </div>
                            )}

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Status
                                </h3>
                                <Badge variant={detailsItem.is_active ? "default" : "secondary"}>
                                    {detailsItem.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDetails(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}