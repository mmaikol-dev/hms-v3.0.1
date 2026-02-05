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
import { Plus, Trash, Loader2, ArrowLeft, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    source_type?: "prescription_item" | "lab_test_request";
    source_id?: number;
}

export default function CreateInvoice() {
    const { patients } = usePage().props as any;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [loadingBillableItems, setLoadingBillableItems] = useState(false);

    // Format current date and time for datetime-local input
    const getCurrentDateTime = () => {
        const now = new Date();
        // Format to YYYY-MM-DDTHH:mm
        return now.toISOString().slice(0, 16);
    };

    // Add 30 days for due date
    const getDefaultDueDate = () => {
        const now = new Date();
        now.setDate(now.getDate() + 30);
        return now.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        patient_id: "",
        file_no: "",
        member_no: "",
        invoice_date: getCurrentDateTime(),
        due_date: getDefaultDueDate(),
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

    // Handle patient selection and auto-populate file_no and member_no
    const handlePatientChange = async (patientId: string) => {
        const selectedPatient = patients?.find((p: any) => p.id.toString() === patientId);

        setFormData({
            ...formData,
            patient_id: patientId,
            file_no: selectedPatient?.file_no || "",
            member_no: selectedPatient?.member_no || "",
        });

        if (!patientId) return;

        setLoadingBillableItems(true);
        try {
            const response = await fetch(`/invoices/patient/${patientId}/billable-items`);
            if (!response.ok) {
                throw new Error("Failed to load billable items");
            }

            const data = await response.json();
            const fetchedItems = (data.items || []) as InvoiceItem[];

            if (fetchedItems.length > 0) {
                setItems(fetchedItems);
            } else {
                setItems([
                    {
                        item_type: "consultation",
                        description: "",
                        quantity: 1,
                        unit_price: 0,
                        amount: 0,
                    },
                ]);
            }
        } catch (error) {
            console.error(error);
            alert("Could not auto-load dispensed prescriptions and completed lab tests.");
        } finally {
            setLoadingBillableItems(false);
        }
    };

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

        // Amount is NOT multiplied by quantity - the entered amount IS the total
        if (field === "unit_price") {
            newItems[index].amount = parseFloat(value) || 0;
        }
        // If quantity changes, amount stays the same (no multiplication)
        if (field === "quantity") {
            newItems[index].amount = newItems[index].unit_price;
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
            currency: "KES",
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

        // Format the date-time for backend (convert to MySQL datetime format)
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

    // Mobile Summary Sheet
    const MobileSummarySheet = () => (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="bottom" className="h-[85vh] p-0">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Invoice Summary</SheetTitle>
                    <SheetDescription>
                        Review and create your invoice
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(85vh-120px)] px-6">
                    <div className="space-y-4 py-4">
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

                        <div className="pt-6 space-y-3">
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={processing}
                                onClick={(e) => {
                                    setIsMobileMenuOpen(false);
                                    handleSubmit(e);
                                }}
                            >
                                {processing && (
                                    <Loader2
                                        className="mr-2 animate-spin"
                                        size={16}
                                    />
                                )}
                                Create Invoice
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Continue Editing
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />

            {/* Mobile Summary Sheet */}
            <MobileSummarySheet />

            <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-4 max-w-6xl mx-auto">
                {/* MOBILE HEADER */}
                <div className="flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit("/invoices")}
                            className="h-9 w-9"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">
                                Create Invoice
                            </h1>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="h-9 w-9"
                    >
                        <Menu size={18} />
                    </Button>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex items-center gap-4">
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

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* INVOICE DETAILS - Mobile Stack Layout */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">
                                Invoice Information
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Basic invoice details and patient information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="lg:col-span-2">
                                <Label>Patient *</Label>
                                <Select
                                    value={formData.patient_id}
                                    onValueChange={handlePatientChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients?.map((patient: any) => (
                                            <SelectItem
                                                key={patient.id}
                                                value={patient.id.toString()}
                                            >
                                                <span className="truncate">
                                                    {patient.name} (ID: {patient.id})
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {loadingBillableItems && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Loading dispensed prescriptions and completed lab tests...
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>File Number</Label>
                                <Input
                                    type="text"
                                    value={formData.file_no}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            file_no: e.target.value,
                                        })
                                    }
                                    placeholder="Auto-filled or enter manually"
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Auto-populated from patient record
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Member Number</Label>
                                <Input
                                    type="text"
                                    value={formData.member_no}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            member_no: e.target.value,
                                        })
                                    }
                                    placeholder="Auto-filled or enter manually"
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Auto-populated from patient record
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Invoice Date & Time *</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.invoice_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            invoice_date: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Select date and time for invoice creation
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Due Date & Time *</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            due_date: e.target.value,
                                        })
                                    }
                                    min={formData.invoice_date}
                                    required
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Select due date and time
                                </p>
                            </div>

                            <div className="space-y-2">
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
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
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
                                    className="w-full"
                                />
                            </div>

                            <div className="lg:col-span-2 space-y-2">
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
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* INVOICE ITEMS - Mobile Card Layout */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg md:text-xl">
                                        Invoice Items
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Add items or services to this invoice
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                    className="w-full md:w-auto"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Layout */}
                            <div className="space-y-4 md:hidden">
                                {items.map((item, index) => (
                                    <Card key={index} className="relative">
                                        <CardContent className="pt-6">
                                            <div className="absolute top-2 right-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    className="h-8 w-8"
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Type</Label>
                                                    <Select
                                                        value={item.item_type}
                                                        onValueChange={(value) =>
                                                            updateItem(index, "item_type", value)
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

                                                <div className="space-y-2">
                                                    <Label className="text-xs">Description *</Label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateItem(index, "description", e.target.value)
                                                        }
                                                        placeholder="Item description"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Quantity</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItem(index, "quantity", parseInt(e.target.value) || 1)
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Total Amount</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.unit_price}
                                                            onChange={(e) =>
                                                                updateItem(index, "unit_price", parseFloat(e.target.value) || 0)
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Amount:</span>
                                                        <span className="font-semibold">
                                                            {formatCurrency(item.amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:block">
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
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
                                                        Total Amount
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
                                                                onValueChange={(value) =>
                                                                    updateItem(index, "item_type", value)
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) =>
                                                                    updateItem(index, "description", e.target.value)
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
                                                                    updateItem(index, "quantity", parseInt(e.target.value) || 1)
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
                                                                    updateItem(index, "unit_price", parseFloat(e.target.value) || 0)
                                                                }
                                                                required
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {formatCurrency(item.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeItem(index)}
                                                                disabled={items.length === 1}
                                                            >
                                                                <Trash size={16} />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SUMMARY - Desktop Only */}
                    <div className="hidden md:block">
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
                    </div>

                    {/* ACTIONS - Desktop Only */}
                    <div className="hidden md:flex justify-end gap-3">
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

                    {/* MOBILE FLOATING ACTIONS */}
                    <div className="fixed bottom-4 left-4 right-4 md:hidden">
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Total:</span>
                                <span className="font-bold text-lg text-primary">
                                    {formatCurrency(calculateTotal())}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit("/invoices")}
                                    disabled={processing}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={processing}
                                    size="sm"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 animate-spin" size={14} />
                                            Creating...
                                        </>
                                    ) : (
                                        "Review & Create"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
