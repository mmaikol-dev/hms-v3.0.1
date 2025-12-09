"use client";

import { useState } from "react";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Plus, Trash, Loader2, ArrowLeft } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Invoices", href: "/invoices" },
    { title: "Create Invoice", href: "/invoices/create" },
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

interface InvoiceItem {
    item_type: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

export default function CreateInvoice() {
    const { patients } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: "",
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: "",
        tax_amount: "0.00",
        discount_amount: "0.00",
        notes: "",
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        {
            item_type: "consultation",
            description: "",
            quantity: 1,
            unit_price: 0,
            amount: 0,
        },
    ]);

    const addItem = () => {
        setItems([
            ...items,
            {
                item_type: "consultation",
                description: "",
                quantity: 1,
                unit_price: 0,
                amount: 0,
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Calculate amount
        if (field === "quantity" || field === "unit_price") {
            newItems[index].amount =
                newItems[index].quantity * newItems[index].unit_price;
        }

        setItems(newItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = parseFloat(formData.tax_amount) || 0;
        const discount = parseFloat(formData.discount_amount) || 0;
        return subtotal + tax - discount;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.patient_id) {
            alert("Please select a patient");
            return;
        }

        if (!formData.due_date) {
            alert("Please set a due date");
            return;
        }

        if (items.some((item) => !item.description || item.unit_price <= 0)) {
            alert("Please fill in all item details");
            return;
        }

        setProcessing(true);

        const payload = {
            ...formData,
            items: items,
        };

        router.post("/invoices", payload, {
            onFinish: () => {
                setProcessing(false);
            },
            onSuccess: () => {
                router.visit("/invoices");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />

            <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit("/invoices")}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Create New Invoice
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Fill in the details below to generate an invoice
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* INVOICE DETAILS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Information</CardTitle>
                            <CardDescription>
                                Basic invoice details and patient information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Patient *</Label>
                                <Select
                                    value={formData.patient_id}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            patient_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients?.map((patient: any) => (
                                            <SelectItem
                                                key={patient.id}
                                                value={patient.id.toString()}
                                            >
                                                {patient.name} (ID: {patient.id}
                                                )
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Invoice Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.invoice_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            invoice_date: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label>Due Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            due_date: e.target.value,
                                        })
                                    }
                                    min={formData.invoice_date}
                                    required
                                />
                            </div>

                            <div>
                                <Label>Tax Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.tax_amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tax_amount: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Discount Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.discount_amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            discount_amount: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    placeholder="Additional notes or instructions..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* INVOICE ITEMS */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Invoice Items</CardTitle>
                                    <CardDescription>
                                        Add items or services to this invoice
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[140px]">
                                                Type
                                            </TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="w-[100px]">
                                                Qty
                                            </TableHead>
                                            <TableHead className="w-[120px]">
                                                Unit Price
                                            </TableHead>
                                            <TableHead className="w-[120px]">
                                                Amount
                                            </TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Select
                                                        value={item.item_type}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            updateItem(
                                                                index,
                                                                "item_type",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {itemTypes.map(
                                                                (type) => (
                                                                    <SelectItem
                                                                        key={
                                                                            type
                                                                        }
                                                                        value={
                                                                            type
                                                                        }
                                                                    >
                                                                        {type.replace(
                                                                            "_",
                                                                            " "
                                                                        )}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={
                                                            item.description
                                                        }
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Item description"
                                                        required
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                "quantity",
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 1
                                                            )
                                                        }
                                                        required
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                "unit_price",
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        required
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(
                                                        item.amount
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        disabled={
                                                            items.length === 1
                                                        }
                                                    >
                                                        <Trash size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SUMMARY */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(calculateSubtotal())}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Tax
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            parseFloat(formData.tax_amount) || 0
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Discount
                                    </span>
                                    <span className="font-medium text-red-600">
                                        -
                                        {formatCurrency(
                                            parseFloat(
                                                formData.discount_amount
                                            ) || 0
                                        )}
                                    </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-semibold text-lg">
                                        Total Amount
                                    </span>
                                    <span className="font-bold text-2xl text-primary">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit("/invoices")}
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
                            Create Invoice
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}