"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
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
import { ArrowLeft, Loader2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Inventory Items", href: "/inventoryitems" },
    { title: "Add Item", href: "/inventoryitems/create" },
];

const categories = [
    "Medical Equipment",
    "Laboratory Supplies",
    "Office Supplies",
    "Cleaning Supplies",
    "Personal Protective Equipment",
    "Furniture",
    "Electronics",
    "Surgical Instruments",
    "Diagnostic Tools",
    "Other"
];

const unitsOfMeasure = [
    "Pieces",
    "Box",
    "Pack",
    "Carton",
    "Kilogram",
    "Gram",
    "Liter",
    "Milliliter",
    "Meter",
    "Set",
    "Dozen",
    "Unit"
];

export default function InventoryItemsCreate() {
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        item_name: "",
        item_code: "",
        category: "",
        description: "",
        unit_of_measure: "",
        quantity_in_stock: "",
        reorder_level: "",
        unit_cost: "",
        supplier: "",
        last_purchase_date: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post("/inventoryitems", formData, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                router.visit("/inventoryitems");
            },
        });
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Inventory Item" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit("/inventoryitems")}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-semibold">Add New Inventory Item</h1>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Item Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Item Name */}
                                <div>
                                    <Label htmlFor="item_name">
                                        Item Name *
                                    </Label>
                                    <Input
                                        id="item_name"
                                        required
                                        value={formData.item_name}
                                        onChange={(e) =>
                                            handleChange("item_name", e.target.value)
                                        }
                                        placeholder="Enter item name"
                                    />
                                </div>

                                {/* Item Code */}
                                <div>
                                    <Label htmlFor="item_code">
                                        Item Code *
                                    </Label>
                                    <Input
                                        id="item_code"
                                        required
                                        value={formData.item_code}
                                        onChange={(e) =>
                                            handleChange("item_code", e.target.value)
                                        }
                                        placeholder="Enter unique item code"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            handleChange("category", value)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Unit of Measure */}
                                <div>
                                    <Label htmlFor="unit_of_measure">
                                        Unit of Measure *
                                    </Label>
                                    <Select
                                        value={formData.unit_of_measure}
                                        onValueChange={(value) =>
                                            handleChange("unit_of_measure", value)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unitsOfMeasure.map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quantity in Stock */}
                                <div>
                                    <Label htmlFor="quantity_in_stock">
                                        Quantity in Stock *
                                    </Label>
                                    <Input
                                        id="quantity_in_stock"
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.quantity_in_stock}
                                        onChange={(e) =>
                                            handleChange(
                                                "quantity_in_stock",
                                                e.target.value
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                {/* Reorder Level */}
                                <div>
                                    <Label htmlFor="reorder_level">
                                        Reorder Level *
                                    </Label>
                                    <Input
                                        id="reorder_level"
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.reorder_level}
                                        onChange={(e) =>
                                            handleChange(
                                                "reorder_level",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Minimum stock threshold"
                                    />
                                </div>

                                {/* Unit Cost */}
                                <div>
                                    <Label htmlFor="unit_cost">
                                        Unit Cost ($) *
                                    </Label>
                                    <Input
                                        id="unit_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.unit_cost}
                                        onChange={(e) =>
                                            handleChange("unit_cost", e.target.value)
                                        }
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Supplier */}
                                <div>
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Input
                                        id="supplier"
                                        value={formData.supplier}
                                        onChange={(e) =>
                                            handleChange("supplier", e.target.value)
                                        }
                                        placeholder="Enter supplier name"
                                    />
                                </div>

                                {/* Last Purchase Date */}
                                <div>
                                    <Label htmlFor="last_purchase_date">
                                        Last Purchase Date
                                    </Label>
                                    <Input
                                        id="last_purchase_date"
                                        type="date"
                                        value={formData.last_purchase_date}
                                        onChange={(e) =>
                                            handleChange(
                                                "last_purchase_date",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter item description, specifications, or notes..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit("/inventoryitems")}
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
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}