"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Receipt, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Payments", href: "/payments" },
    { title: "Record Payment", href: "/payments/create" },
];

const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "insurance", label: "Insurance" },
    { value: "cheque", label: "Cheque" },
];

export default function PaymentCreate() {
    const { invoices, users, auth } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [formData, setFormData] = useState({
        invoice_id: "",
        amount: "",
        payment_method: "",
        transaction_id: "",
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
        received_by: auth?.user?.id?.toString() || "",
    });

    const [errors, setErrors] = useState<any>({});

    // Update selected invoice details when invoice is selected
    useEffect(() => {
        if (formData.invoice_id) {
            const invoice = invoices?.find(
                (inv: any) => inv.id.toString() === formData.invoice_id
            );
            setSelectedInvoice(invoice);

            // Auto-fill amount with remaining balance
            if (invoice) {
                setFormData((prev) => ({
                    ...prev,
                    amount: invoice.balance?.toString() || "",
                }));
            }
        } else {
            setSelectedInvoice(null);
        }
    }, [formData.invoice_id, invoices]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.invoice_id) {
            newErrors.invoice_id = "Please select an invoice";
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = "Amount must be greater than 0";
        }
        if (selectedInvoice && parseFloat(formData.amount) > selectedInvoice.balance) {
            newErrors.amount = "Amount cannot exceed invoice balance";
        }
        if (!formData.payment_method) {
            newErrors.payment_method = "Please select a payment method";
        }
        if (!formData.payment_date) {
            newErrors.payment_date = "Payment date is required";
        }
        if (!formData.received_by) {
            newErrors.received_by = "Please select who received the payment";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setProcessing(true);

        router.post("/payments", formData, {
            preserveScroll: true,
            onSuccess: () => {
                // Reset form
                setFormData({
                    invoice_id: "",
                    amount: "",
                    payment_method: "",
                    transaction_id: "",
                    payment_date: new Date().toISOString().split("T")[0],
                    notes: "",
                    received_by: auth?.user?.id?.toString() || "",
                });
                setSelectedInvoice(null);
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Payment" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-2">
                    <Receipt className="h-6 w-6" />
                    <h1 className="text-2xl font-semibold">Record New Payment</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Selection & Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Invoice Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="invoice_id">
                                    Select Invoice <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.invoice_id}
                                    onValueChange={(value) => handleChange("invoice_id", value)}
                                >
                                    <SelectTrigger className={errors.invoice_id ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select an invoice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {invoices?.map((invoice: any) => (
                                            <SelectItem
                                                key={invoice.id}
                                                value={invoice.id.toString()}
                                                disabled={invoice.balance <= 0}
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <span>
                                                        {invoice.invoice_number} - {invoice.patient?.name}
                                                    </span>
                                                    <span className="ml-4 text-muted-foreground">
                                                        Balance: {formatCurrency(invoice.balance)}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.invoice_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.invoice_id}</p>
                                )}
                            </div>

                            {/* Invoice Details Display */}
                            {selectedInvoice && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Patient</p>
                                                <p className="font-medium">{selectedInvoice.patient?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Amount</p>
                                                <p className="font-medium">
                                                    {formatCurrency(selectedInvoice.total_amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Paid</p>
                                                <p className="font-medium text-green-600">
                                                    {formatCurrency(selectedInvoice.paid_amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Balance Due</p>
                                                <p className="font-semibold text-orange-600">
                                                    {formatCurrency(selectedInvoice.balance)}
                                                </p>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount">
                                        Amount <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => handleChange("amount", e.target.value)}
                                        className={errors.amount ? "border-red-500" : ""}
                                    />
                                    {errors.amount && (
                                        <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                                    )}
                                    {selectedInvoice && formData.amount && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Remaining balance: {formatCurrency(
                                                selectedInvoice.balance - parseFloat(formData.amount || "0")
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="payment_date">
                                        Payment Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={formData.payment_date}
                                        onChange={(e) => handleChange("payment_date", e.target.value)}
                                        className={errors.payment_date ? "border-red-500" : ""}
                                    />
                                    {errors.payment_date && (
                                        <p className="text-sm text-red-500 mt-1">{errors.payment_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="payment_method">
                                        Payment Method <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) => handleChange("payment_method", value)}
                                    >
                                        <SelectTrigger className={errors.payment_method ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    {method.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_method && (
                                        <p className="text-sm text-red-500 mt-1">{errors.payment_method}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="transaction_id">Transaction ID (Optional)</Label>
                                    <Input
                                        id="transaction_id"
                                        type="text"
                                        placeholder="Enter transaction ID"
                                        value={formData.transaction_id}
                                        onChange={(e) => handleChange("transaction_id", e.target.value)}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="received_by">
                                        Received By <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.received_by}
                                        onValueChange={(value) => handleChange("received_by", value)}
                                    >
                                        <SelectTrigger className={errors.received_by ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users?.map((user: any) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.received_by && (
                                        <p className="text-sm text-red-500 mt-1">{errors.received_by}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional notes about this payment..."
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit("/payments")}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 animate-spin" size={16} />}
                            Record Payment
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}