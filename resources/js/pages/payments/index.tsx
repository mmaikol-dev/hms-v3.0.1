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
    DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Search,
    Edit,
    Trash,
    Eye,
    Loader2,
    Receipt,
    DollarSign,
    Calendar,
    FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Payments", href: "/payments" },
];

const paymentMethodColors: Record<string, string> = {
    cash: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    card: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    bank_transfer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    mobile_money: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    insurance: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    cheque: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
};

export default function PaymentsIndex() {
    const { payments, stats } = usePage().props as any;

    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingPayment, setViewingPayment] = useState<any>(null);

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/payments",
            { search, date: dateFilter },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openViewModal = (payment: any) => {
        setViewingPayment(payment);
        setOpenView(true);
    };

    const openEditModal = (payment: any) => {
        setEditingPayment({
            ...payment,
        });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingPayment) return;

        setProcessing(true);

        router.put(`/payments/${editingPayment.id}`, editingPayment, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this payment? This will reverse the payment on the invoice.")) {
            router.delete(`/payments/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            <div className="flex flex-col gap-6 p-4">
                {/* STATS CARDS */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Payments
                                </CardTitle>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_count || 0}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Amount
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.total_amount || 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Today's Payments
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.today_count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.today_amount || 0)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    This Month
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.month_amount || 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Payment Records</h1>

                    <Link href="/payments/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Record Payment
                        </Button>
                    </Link>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex gap-2 w-full md:w-2/3">
                        <Input
                            placeholder="Search by payment number, patient name, or invoice..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-40"
                        />
                        <Button onClick={handleSearch}>
                            <Search size={16} />
                        </Button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!payments ? (
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
                                    <TableHead>Payment #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Received By</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {payments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-8"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Receipt className="h-12 w-12 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    No payments found.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.data.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {payment.payment_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {payment.patient?.name || payment.invoice?.patient?.name || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ID: {payment.patient?.patient_number || payment.invoice?.patient?.patient_number || "N/A"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {payment.invoice?.invoice_number || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(payment.payment_date)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={paymentMethodColors[payment.payment_method] || ""}
                                                >
                                                    {payment.payment_method.replace("_", " ").toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-600">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {payment.received_by_user?.name || "N/A"}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openViewModal(payment)}
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(payment)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(payment.id)}
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
                {payments && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {payments.from || 0} to {payments.to || 0} of{" "}
                            {payments.total || 0}
                        </div>

                        <div className="flex gap-2">
                            {payments.links?.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded-md border transition-colors ${link.active
                                            ? "bg-primary text-white border-primary"
                                            : "bg-background text-foreground hover:bg-muted"
                                        } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                VIEW MODAL
            ============================ */}
            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>

                    {viewingPayment && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Payment Number
                                    </p>
                                    <p className="font-semibold">
                                        {viewingPayment.payment_number}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Amount
                                    </p>
                                    <p className="font-semibold text-green-600 text-xl">
                                        {formatCurrency(viewingPayment.amount)}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Patient
                                    </p>
                                    <p className="font-medium">
                                        {viewingPayment.patient?.name || viewingPayment.invoice?.patient?.name || "N/A"}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Invoice Number
                                    </p>
                                    <p className="font-medium">
                                        {viewingPayment.invoice?.invoice_number || "N/A"}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Payment Date
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(viewingPayment.payment_date)}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Payment Method
                                    </p>
                                    <Badge className={paymentMethodColors[viewingPayment.payment_method] || ""}>
                                        {viewingPayment.payment_method.replace("_", " ").toUpperCase()}
                                    </Badge>
                                </div>

                                {viewingPayment.transaction_id && (
                                    <div className="p-4 bg-muted rounded-lg col-span-2">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Transaction ID
                                        </p>
                                        <p className="font-mono text-sm">
                                            {viewingPayment.transaction_id}
                                        </p>
                                    </div>
                                )}

                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Received By
                                    </p>
                                    <p className="font-medium">
                                        {viewingPayment.received_by_user?.name || "N/A"}
                                    </p>
                                </div>

                                {viewingPayment.notes && (
                                    <div className="p-4 bg-muted rounded-lg col-span-2">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Notes
                                        </p>
                                        <p className="text-sm">
                                            {viewingPayment.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenView(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===========================
                EDIT MODAL
            ============================ */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Payment</DialogTitle>
                    </DialogHeader>

                    {editingPayment && (
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>Transaction ID</Label>
                                <Input
                                    value={editingPayment.transaction_id || ""}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            transaction_id: e.target.value,
                                        })
                                    }
                                    placeholder="Enter transaction ID"
                                />
                            </div>

                            <div>
                                <Label>Notes</Label>
                                <Textarea
                                    value={editingPayment.notes || ""}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            notes: e.target.value,
                                        })
                                    }
                                    rows={4}
                                    placeholder="Add any additional notes..."
                                />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Note: Only transaction ID and notes can be edited. To modify other details, delete this payment and create a new one.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenEdit(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 animate-spin" size={16} />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}