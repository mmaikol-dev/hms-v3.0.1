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
import { Textarea } from "@/components/ui/textarea";

import {
    Plus,
    Search,
    Edit,
    Trash,
    Eye,
    Loader2,
    FileText,
    AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Invoices", href: "/invoices" },
];

export default function InvoicesIndex() {
    const { invoices = { data: [] }, patients = [] } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);

    const [openDetails, setOpenDetails] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<any>(null);

    // Search
    const handleSearch = () => {
        router.get(
            "/invoices",
            { search, status: statusFilter !== "all" ? statusFilter : undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Edit Modal
    const openEditModal = (invoice: any) => {
        setEditingInvoice({ ...invoice });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingInvoice) return;

        setProcessing(true);

        router.put(`/invoices/${editingInvoice.id}`, editingInvoice, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    // View Details
    const viewDetails = (invoice: any) => {
        fetch(`/invoices/${invoice.id}`)
            .then((res) => res.json())
            .then((data) => {
                setViewingInvoice(data);
                setOpenDetails(true);
            })
            .catch(console.error);
    };

    // Status Badge
    const getStatusBadge = (status: string) => {
        const variants: any = {
            pending: "warning",
            paid: "success",
            partially_paid: "default",
            cancelled: "destructive",
            overdue: "destructive",
        };

        return (
            <Badge variant={variants[status] || "default"}>
                {status.replace("_", " ")}
            </Badge>
        );
    };

    // Currency Format
    const formatCurrency = (amount: number) => {
        if (!amount) return "$0.00";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // Date Format
    const formatDate = (date: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const invoiceList = invoices?.data ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="flex flex-col gap-4 p-4">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Invoices</h1>

                    <Link href="/invoices/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Create Invoice
                        </Button>
                    </Link>
                </div>

                {/* FILTERS */}
                <div className="flex gap-2 w-full flex-wrap">
                    <div className="flex gap-2 flex-1 min-w-[250px]">
                        <Input
                            placeholder="Search invoice number or patient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button onClick={handleSearch}>
                            <Search size={16} />
                        </Button>
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            router.get(
                                "/invoices",
                                {
                                    search,
                                    status: value !== "all" ? value : undefined,
                                },
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partially_paid">
                                Partially Paid
                            </SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!invoices ? (
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
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {invoiceList.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center py-4"
                                        >
                                            No invoices found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoiceList.map((inv: any) => (
                                        <TableRow key={inv.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText
                                                        size={16}
                                                        className="text-muted-foreground"
                                                    />
                                                    <span className="font-mono font-medium">
                                                        {inv.invoice_number}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {inv.patient?.first_name + " " + inv.patient?.last_name ||
                                                            "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ID:{" "}
                                                        {inv.patient?.id || "N/A"}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {formatDate(inv.invoice_date)}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {formatDate(inv.due_date)}
                                                    {new Date(
                                                        inv.due_date
                                                    ) < new Date() &&
                                                        inv.status ===
                                                        "pending" && (
                                                            <AlertCircle
                                                                size={14}
                                                                className="text-destructive"
                                                            />
                                                        )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="font-medium">
                                                {formatCurrency(
                                                    inv.total_amount
                                                )}
                                            </TableCell>

                                            <TableCell className="text-green-600">
                                                {formatCurrency(
                                                    inv.paid_amount
                                                )}
                                            </TableCell>

                                            <TableCell className="font-medium">
                                                {formatCurrency(
                                                    (inv.total_amount ?? 0) -
                                                    (inv.paid_amount ?? 0)
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {getStatusBadge(inv.status)}
                                            </TableCell>

                                            <TableCell className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        viewDetails(inv)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={
                                                        inv.status !== "pending"
                                                    }
                                                    onClick={() =>
                                                        openEditModal(inv)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={
                                                        inv.paid_amount > 0
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Are you sure you want to delete this invoice?"
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/invoices/${inv.id}`
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
                {invoices && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {invoices.from} to {invoices.to} of{" "}
                            {invoices.total}
                        </div>

                        <div className="flex gap-2">
                            {invoices.links.map((link: any, i: number) => (
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                    </DialogHeader>

                    {editingInvoice && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                                <div className="text-sm text-muted-foreground">
                                    Invoice Number
                                </div>
                                <div className="font-mono font-semibold">
                                    {editingInvoice.invoice_number}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={editingInvoice.due_date}
                                    onChange={(e) =>
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            due_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* TAX */}
                            <div>
                                <Label>Tax Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingInvoice.tax_amount}
                                    onChange={(e) =>
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            tax_amount: parseFloat(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                            </div>

                            {/* DISCOUNT */}
                            <div>
                                <Label>Discount Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingInvoice.discount_amount}
                                    onChange={(e) =>
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            discount_amount: parseFloat(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                            </div>

                            {/* NOTES */}
                            <div className="md:col-span-2">
                                <Label>Notes</Label>
                                <Textarea
                                    rows={3}
                                    value={editingInvoice.notes ?? ""}
                                    onChange={(e) =>
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* SUMMARY */}
                            <div className="md:col-span-2 p-4 bg-muted rounded-lg grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">
                                        Subtotal
                                    </div>
                                    <div className="font-semibold">
                                        {formatCurrency(
                                            editingInvoice.subtotal
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-muted-foreground">
                                        Total
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {formatCurrency(
                                            editingInvoice.total_amount
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-muted-foreground">
                                        Balance
                                    </div>
                                    <div className="font-semibold text-lg text-orange-600">
                                        {formatCurrency(
                                            editingInvoice.total_amount -
                                            editingInvoice.paid_amount
                                        )}
                                    </div>
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
                                    size={16}
                                    className="animate-spin mr-2"
                                />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DETAILS MODAL */}
            <Dialog open={openDetails} onOpenChange={setOpenDetails}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Invoice Details</DialogTitle>
                    </DialogHeader>

                    {viewingInvoice && (
                        <div className="space-y-4 mt-4">

                            {/* HEADER */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Invoice Number
                                    </div>
                                    <div className="font-mono font-semibold text-lg">
                                        {viewingInvoice.invoice_number}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Status
                                    </div>
                                    <div className="mt-1">
                                        {getStatusBadge(
                                            viewingInvoice.status
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Patient
                                    </div>
                                    <div className="font-medium">
                                        {viewingInvoice.patient?.full_name ??
                                            "Unknown"}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Invoice Date
                                    </div>
                                    <div>
                                        {formatDate(
                                            viewingInvoice.invoice_date
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ITEMS */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="p-4 bg-muted/50 border-b">
                                    <h3 className="font-semibold">Items</h3>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {(viewingInvoice.items ?? []).length >
                                            0 ? (
                                            viewingInvoice.items.map(
                                                (item: any) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            {item.type}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(
                                                                item.price
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(
                                                                item.total
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center py-3"
                                                >
                                                    No items found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
