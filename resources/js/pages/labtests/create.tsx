"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Lab Tests", href: "/labtests" },
    { title: "Create", href: "/labtests/create" },
];

const categories = [
    "Hematology",
    "Biochemistry",
    "Microbiology",
    "Immunology",
    "Pathology",
    "Radiology",
    "Other"
];

interface FormData {
    test_name: string;
    test_code: string;
    description: string;
    category: string;
    price: string;
    normal_duration_hours: string;
    preparation_instructions: string;
    is_active: boolean;
}

interface FormErrors {
    [key: string]: string;
}

export default function LabTestCreate() {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState<FormData>({
        test_name: "",
        test_code: "",
        description: "",
        category: "",
        price: "",
        normal_duration_hours: "",
        preparation_instructions: "",
        is_active: true,
    });

    const handleChange = (
        field: keyof FormData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.test_name.trim()) {
            newErrors.test_name = "Test name is required";
        }

        if (!formData.test_code.trim()) {
            newErrors.test_code = "Test code is required";
        }

        if (!formData.category) {
            newErrors.category = "Category is required";
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = "Valid price is required";
        }

        if (!formData.normal_duration_hours || parseInt(formData.normal_duration_hours) <= 0) {
            newErrors.normal_duration_hours = "Valid duration is required";
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

        router.post("/labtests", formData, {
            preserveScroll: true,
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
            onError: (errors) => {
                setErrors(errors as FormErrors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Lab Test" />

            <div className="flex flex-col gap-4 p-4 max-w-4xl">
                {/* TOP BAR */}
                <div className="flex items-center gap-4">
                    <Link href="/labtests">
                        <Button variant="outline" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">Create Lab Test</h1>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lab Test Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Test Name */}
                                <div>
                                    <Label htmlFor="test_name">
                                        Test Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="test_name"
                                        value={formData.test_name}
                                        onChange={(e) =>
                                            handleChange("test_name", e.target.value)
                                        }
                                        placeholder="e.g., Complete Blood Count"
                                        className={errors.test_name ? "border-destructive" : ""}
                                    />
                                    {errors.test_name && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.test_name}
                                        </p>
                                    )}
                                </div>

                                {/* Test Code */}
                                <div>
                                    <Label htmlFor="test_code">
                                        Test Code <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="test_code"
                                        value={formData.test_code}
                                        onChange={(e) =>
                                            handleChange("test_code", e.target.value.toUpperCase())
                                        }
                                        placeholder="e.g., CBC-001"
                                        className={errors.test_code ? "border-destructive" : ""}
                                    />
                                    {errors.test_code && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.test_code}
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <Label htmlFor="category">
                                        Category <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            handleChange("category", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={errors.category ? "border-destructive" : ""}
                                        >
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <Label htmlFor="price">
                                        Price ($) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) =>
                                            handleChange("price", e.target.value)
                                        }
                                        placeholder="e.g., 50.00"
                                        className={errors.price ? "border-destructive" : ""}
                                    />
                                    {errors.price && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div>
                                    <Label htmlFor="normal_duration_hours">
                                        Normal Duration (hours) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="normal_duration_hours"
                                        type="number"
                                        min="1"
                                        value={formData.normal_duration_hours}
                                        onChange={(e) =>
                                            handleChange("normal_duration_hours", e.target.value)
                                        }
                                        placeholder="e.g., 24"
                                        className={
                                            errors.normal_duration_hours
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors.normal_duration_hours && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.normal_duration_hours}
                                        </p>
                                    )}
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) =>
                                            handleChange("is_active", e.target.checked)
                                        }
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Active (available for booking)
                                    </Label>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleChange("description", e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Brief description of the test..."
                                    />
                                </div>

                                {/* Preparation Instructions */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="preparation_instructions">
                                        Preparation Instructions
                                    </Label>
                                    <Textarea
                                        id="preparation_instructions"
                                        value={formData.preparation_instructions}
                                        onChange={(e) =>
                                            handleChange(
                                                "preparation_instructions",
                                                e.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="e.g., Patient should fast for 12 hours before the test. Avoid alcohol 24 hours prior..."
                                    />
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Link href="/labtests">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader2
                                            className="mr-2 animate-spin"
                                            size={16}
                                        />
                                    )}
                                    Create Lab Test
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}