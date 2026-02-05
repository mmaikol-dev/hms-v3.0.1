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
    Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Invoices", href: "/invoices" },
];

export default function InvoicesIndex() {
    const { invoices = { data: [] }, patients = [] } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

    // Handle Download
    const handleDownload = async (invoice: any) => {
        setDownloadingId(invoice.id);
        try {
            const link = document.createElement('a');
            link.href = `/invoices/${invoice.id}/download`;
            link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setTimeout(() => setDownloadingId(null), 500);
        }
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
        setViewingInvoice(invoice);
        setOpenDetails(true);
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
        if (!amount && amount !== 0) return "$0.00";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "KES",
        }).format(amount);
    };

    // Date Format - Updated to show date and time
    const formatDate = (date: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // New function to format date with time (without timezone conversion)
    const formatDateTime = (date: string) => {
        if (!date) return "N/A";

        // Remove any timezone info and parse as local time
        // Replace space with 'T' to handle both formats: "2026-01-21 14:27:00" and "2026-01-21T14:27:00"
        const dateStr = date.replace(' ', 'T').split('.')[0].split('+')[0].split('Z')[0];

        // Parse the date components manually to avoid timezone conversion
        const [datePart, timePart] = dateStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = (timePart || '00:00:00').split(':').map(Number);

        // Create date using local timezone
        const d = new Date(year, month - 1, day, hours, minutes);

        // Format the output
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let displayHours = hours % 12;
        displayHours = displayHours === 0 ? 12 : displayHours;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        return `${monthNames[month - 1]} ${day}, ${year}, ${displayHours}:${minutesStr} ${ampm}`;
    };

    // Calculate balance
    const calculateBalance = (invoice: any) => {
        const total = invoice.total_amount || 0;
        const paid = invoice.paid_amount || 0;
        return total - paid;
    };

    // Check if invoice is overdue
    const isOverdue = (invoice: any) => {
        if (invoice.status !== 'pending') return false;
        if (!invoice.due_date) return false;
        return new Date(invoice.due_date) < new Date();
    };

    const invoiceList = invoices?.data ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="flex flex-col gap-4 p-4">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Invoices</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and download patient invoices
                        </p>
                    </div>

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
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

                {/* OVERDUE WARNING */}
                {invoiceList.some(isOverdue) && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Some invoices are overdue. Please review them.
                        </AlertDescription>
                    </Alert>
                )}

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
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Due Date & Time</TableHead>
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
                                        <TableRow key={inv.id} className={isOverdue(inv) ? "bg-destructive/5" : ""}>
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
                                                <div className="text-sm">
                                                    {formatDateTime(inv.invoice_date)}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <div className="text-sm">
                                                        {formatDateTime(inv.due_date)}
                                                    </div>
                                                    {isOverdue(inv) && (
                                                        <AlertCircle
                                                            size={14}
                                                            className="text-destructive ml-1"
                                                            title="Overdue"
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

                                            <TableCell className={`font-medium ${calculateBalance(inv) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {formatCurrency(
                                                    calculateBalance(inv)
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {getStatusBadge(inv.status)}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex gap-2 justify-end">
                                                    {/* DOWNLOAD BUTTON */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownload(inv)}
                                                        disabled={downloadingId === inv.id}
                                                        title="Download PDF"
                                                        className="flex items-center gap-1"
                                                    >
                                                        {downloadingId === inv.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Download size={14} />
                                                        )}
                                                    </Button>

                                                    {/* VIEW DETAILS */}
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => viewDetails(inv)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </Button>

                                                    {/* EDIT */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={
                                                            inv.status !== "pending"
                                                        }
                                                        onClick={() => openEditModal(inv)}
                                                        title={inv.status !== "pending" ? "Only pending invoices can be edited" : "Edit Invoice"}
                                                    >
                                                        <Edit size={14} />
                                                    </Button>

                                                    {/* DELETE */}
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
                                                        title={inv.paid_amount > 0 ? "Cannot delete invoice with payments" : "Delete Invoice"}
                                                    >
                                                        <Trash size={14} />
                                                    </Button>
                                                </div>
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

                            {/* Due Date with Time */}
                            <div>
                                <Label>Due Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={editingInvoice.due_date ? editingInvoice.due_date.slice(0, 16) : ''}
                                    onChange={(e) =>
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            due_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Invoice Date with Time */}
                            <div>
                                <Label>Invoice Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={editingInvoice.invoice_date ? editingInvoice.invoice_date.slice(0, 16) : ''}
                                    onChange={(e) =>
                                        setEditingInvoice({
                                            ...editingInvoice,
                                            invoice_date: e.target.value,
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

                            {/* DOWNLOAD SECTION */}
                            <div className="md:col-span-2 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Download Invoice</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Generate a PDF version of this invoice
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownload(editingInvoice)}
                                        disabled={downloadingId === editingInvoice.id}
                                        className="flex items-center gap-2"
                                    >
                                        {downloadingId === editingInvoice.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Download size={16} />
                                        )}
                                        Download PDF
                                    </Button>
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
                                            `${viewingInvoice.patient?.first_name} ${viewingInvoice.patient?.last_name}`}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Invoice Date & Time
                                    </div>
                                    <div>
                                        {formatDateTime(
                                            viewingInvoice.invoice_date
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Due Date & Time
                                    </div>
                                    <div>
                                        {formatDateTime(
                                            viewingInvoice.due_date
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DOWNLOAD BUTTON */}
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => handleDownload(viewingInvoice)}
                                    disabled={downloadingId === viewingInvoice.id}
                                    className="flex items-center gap-2"
                                >
                                    {downloadingId === viewingInvoice.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    Download Invoice PDF
                                </Button>
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
                                            <TableHead>Description</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Price</TableHead>
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
                                                            {item.item_type}
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
                                                        <TableCell>
                                                            {formatCurrency(
                                                                item.amount || (item.quantity * item.unit_price)
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

                            {/* SUMMARY */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        Notes
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-md">
                                        {viewingInvoice.notes || "No notes provided"}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        Payment Summary
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-md space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(viewingInvoice.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>{formatCurrency(viewingInvoice.tax_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(viewingInvoice.discount_amount)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-semibold">
                                            <span>Total:</span>
                                            <span>{formatCurrency(viewingInvoice.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-green-600">
                                            <span>Paid:</span>
                                            <span>{formatCurrency(viewingInvoice.paid_amount)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-semibold text-lg">
                                            <span>Balance:</span>
                                            <span className={calculateBalance(viewingInvoice) > 0 ? "text-orange-600" : "text-green-600"}>
                                                {formatCurrency(calculateBalance(viewingInvoice))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
