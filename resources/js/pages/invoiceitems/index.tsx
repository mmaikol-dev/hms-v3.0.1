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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash, Loader2, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Invoice Items", href: "/invoiceitems" },
];

const itemTypes = [
    "consultation",
    "medicine",
    "lab_test",
    "bed_charge",
    "procedure",
    "ambulance",
    "other",
];

export default function InvoiceItemsIndex() {
    const { invoiceItems, invoices } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/invoiceitems",
            {
                search,
                type: typeFilter !== "all" ? typeFilter : undefined,
            },
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

        // Recalculate amount
        const amount = editingItem.quantity * editingItem.unit_price;

        setProcessing(true);

        router.put(
            `/invoiceitems/${editingItem.id}`,
            { ...editingItem, amount },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setOpenEdit(false);
                },
            }
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const getItemTypeBadge = (type: string) => {
        const colors: any = {
            consultation: "default",
            medicine: "secondary",
            lab_test: "outline",
            bed_charge: "default",
            procedure: "secondary",
            ambulance: "destructive",
            other: "outline",
        };

        return (
            <Badge variant={colors[type] || "default"}>
                {type.replace("_", " ")}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice Items" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Invoice Items</h1>

                    <Link href="/invoiceitems/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Item
                        </Button>
                    </Link>
                </div>

                {/* FILTERS */}
                <div className="flex gap-2 w-full flex-wrap">
                    <div className="flex gap-2 flex-1 min-w-[250px]">
                        <Input
                            placeholder="Search by description or invoice..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button onClick={handleSearch}>
                            <Search size={16} />
                        </Button>
                    </div>

                    <Select
                        value={typeFilter}
                        onValueChange={(value) => {
                            setTypeFilter(value);
                            router.get(
                                "/invoiceitems",
                                {
                                    search,
                                    type: value !== "all" ? value : undefined,
                                },
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {itemTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type.replace("_", " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!invoiceItems ? (
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
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {invoiceItems.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No invoice items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoiceItems.data.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText
                                                        size={16}
                                                        className="text-muted-foreground"
                                                    />
                                                    <div>
                                                        <div className="font-mono text-sm font-medium">
                                                            {item.invoice
                                                                ?.invoice_number ||
                                                                "N/A"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.invoice
                                                                ?.patient?.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getItemTypeBadge(
                                                    item.item_type
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.description}
                                            </TableCell>
                                            <TableCell>
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    item.unit_price
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(item.amount)}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Are you sure you want to delete this item?"
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/invoiceitems/${item.id}`
                                                            );
                                                        }
                                                    }}
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
                {invoiceItems && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {invoiceItems.from} to {invoiceItems.to} of{" "}
                            {invoiceItems.total}
                        </div>

                        <div className="flex gap-2">
                            {invoiceItems.links.map((link: any, i: number) => (
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
                        <DialogTitle>Edit Invoice Item</DialogTitle>
                    </DialogHeader>

                    {editingItem && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="md:col-span-2">
                                <Label>Invoice</Label>
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="font-mono font-medium">
                                        {editingItem.invoice?.invoice_number}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {editingItem.invoice?.patient?.name}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Label>Item Type</Label>
                                <Select
                                    value={editingItem.item_type}
                                    onValueChange={(value) =>
                                        setEditingItem({
                                            ...editingItem,
                                            item_type: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {itemTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace("_", " ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Input
                                    value={editingItem.description}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={editingItem.quantity}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            quantity: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Unit Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editingItem.unit_price}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            unit_price: parseFloat(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">
                                        Calculated Amount
                                    </span>
                                    <span className="font-bold text-xl text-primary">
                                        {formatCurrency(
                                            editingItem.quantity *
                                            editingItem.unit_price
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenEdit(false)}
                        >
                            Cancel
                        </Button>
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
        </AppLayout>
    );
}