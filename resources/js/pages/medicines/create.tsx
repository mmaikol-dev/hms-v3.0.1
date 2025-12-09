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
    { title: "Medicines", href: "/medicines" },
    { title: "Add Medicine", href: "/medicines/create" },
];

const categories = [
    "Antibiotic",
    "Painkiller",
    "Antipyretic",
    "Antiviral",
    "Antifungal",
    "Antihistamine",
    "Cardiovascular",
    "Gastrointestinal",
    "Respiratory",
    "Other"
];

const dosageForms = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Cream",
    "Ointment",
    "Drops",
    "Inhaler",
    "Suppository"
];

export default function MedicinesCreate() {
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        generic_name: "",
        brand: "",
        category: "",
        manufacturer: "",
        unit_price: "",
        quantity_in_stock: "",
        reorder_level: "",
        expiry_date: "",
        description: "",
        dosage_form: "",
        strength: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post("/medicines", formData, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                router.visit("/medicines");
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
            <Head title="Add Medicine" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit("/medicines")}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-semibold">Add New Medicine</h1>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Medicine Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Medicine Name */}
                                <div>
                                    <Label htmlFor="name">
                                        Medicine Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleChange("name", e.target.value)
                                        }
                                        placeholder="Enter medicine name"
                                    />
                                </div>

                                {/* Generic Name */}
                                <div>
                                    <Label htmlFor="generic_name">
                                        Generic Name
                                    </Label>
                                    <Input
                                        id="generic_name"
                                        value={formData.generic_name}
                                        onChange={(e) =>
                                            handleChange(
                                                "generic_name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter generic name"
                                    />
                                </div>

                                {/* Brand */}
                                <div>
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        value={formData.brand}
                                        onChange={(e) =>
                                            handleChange("brand", e.target.value)
                                        }
                                        placeholder="Enter brand name"
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

                                {/* Manufacturer */}
                                <div>
                                    <Label htmlFor="manufacturer">
                                        Manufacturer
                                    </Label>
                                    <Input
                                        id="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={(e) =>
                                            handleChange(
                                                "manufacturer",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter manufacturer"
                                    />
                                </div>

                                {/* Dosage Form */}
                                <div>
                                    <Label htmlFor="dosage_form">
                                        Dosage Form
                                    </Label>
                                    <Select
                                        value={formData.dosage_form}
                                        onValueChange={(value) =>
                                            handleChange("dosage_form", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select dosage form" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dosageForms.map((form) => (
                                                <SelectItem key={form} value={form}>
                                                    {form}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Strength */}
                                <div>
                                    <Label htmlFor="strength">Strength</Label>
                                    <Input
                                        id="strength"
                                        value={formData.strength}
                                        onChange={(e) =>
                                            handleChange("strength", e.target.value)
                                        }
                                        placeholder="e.g., 500mg, 10ml"
                                    />
                                </div>

                                {/* Unit Price */}
                                <div>
                                    <Label htmlFor="unit_price">
                                        Unit Price ($) *
                                    </Label>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.unit_price}
                                        onChange={(e) =>
                                            handleChange(
                                                "unit_price",
                                                e.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                    />
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

                                {/* Expiry Date */}
                                <div>
                                    <Label htmlFor="expiry_date">
                                        Expiry Date
                                    </Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={formData.expiry_date}
                                        onChange={(e) =>
                                            handleChange(
                                                "expiry_date",
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
                                        placeholder="Enter medicine description, usage, or special instructions..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit("/medicines")}
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
                                    Add Medicine
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}