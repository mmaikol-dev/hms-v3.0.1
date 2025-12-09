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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Invoice Items", href: "/invoiceitems" },
    { title: "Add Item", href: "/invoiceitems/create" },
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

export default function CreateInvoiceItem() {
    const { invoices } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        invoice_id: "",
        item_type: "consultation",
        description: "",
        quantity: 1,
        unit_price: 0,
    });

    const [calculatedAmount, setCalculatedAmount] = useState(0);

    useEffect(() => {
        setCalculatedAmount(formData.quantity * formData.unit_price);
    }, [formData.quantity, formData.unit_price]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.invoice_id) {
            alert("Please select an invoice");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter a description");
            return;
        }

        if (formData.unit_price <= 0) {
            alert("Unit price must be greater than 0");
            return;
        }

        setProcessing(true);

        const payload = {
            ...formData,
            amount: calculatedAmount,
        };

        router.post("/invoiceitems", payload, {
            onFinish: () => {
                setProcessing(false);
            },
            onSuccess: () => {
                router.visit("/invoiceitems");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Invoice Item" />

            <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit("/invoiceitems")}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Add Invoice Item
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new item to an existing invoice
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ITEM DETAILS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Item Information</CardTitle>
                            <CardDescription>
                                Fill in the item details below
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Invoice *</Label>
                                <Select
                                    value={formData.invoice_id}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            invoice_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Invoice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {invoices?.map((invoice: any) => (
                                            <SelectItem
                                                key={invoice.id}
                                                value={invoice.id.toString()}
                                            >
                                                {invoice.invoice_number} -{" "}
                                                {invoice.patient?.name} (
                                                {formatCurrency(
                                                    invoice.total_amount
                                                )}
                                                )
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Item Type *</Label>
                                <Select
                                    value={formData.item_type}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
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

                            <div>
                                <Label>Description *</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., General Consultation, Blood Test, X-Ray..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Quantity *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantity:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Unit Price *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.unit_price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                unit_price:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CALCULATED AMOUNT */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Amount Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 bg-muted rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">
                                            Total Amount
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formData.quantity} × {formatCurrency(formData.unit_price)}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-primary">
                                        {formatCurrency(calculatedAmount)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit("/invoiceitems")}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2
                                    className="mr-2 animate-spin"
                                    size={16}
                                />
                            )}
                            Add Item
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}