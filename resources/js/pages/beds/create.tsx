"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage, Link } from "@inertiajs/react";
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
    { title: "Beds", href: "/beds" },
    { title: "Create", href: "/beds/create" },
];

interface FormData {
    bed_number: string;
    ward_id: string;
    charge_per_day: string;
    description: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function BedCreate() {
    const { wards } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [selectedWard, setSelectedWard] = useState<any>(null);

    const [formData, setFormData] = useState<FormData>({
        bed_number: "",
        ward_id: "",
        charge_per_day: "",
        description: "",
    });

    const handleChange = (field: keyof FormData, value: string) => {
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

        // Update selected ward details
        if (field === "ward_id") {
            const ward = wards?.find((w: any) => w.id.toString() === value);
            setSelectedWard(ward || null);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.bed_number.trim()) {
            newErrors.bed_number = "Bed number is required";
        }

        if (!formData.ward_id) {
            newErrors.ward_id = "Ward is required";
        }

        if (!formData.charge_per_day || parseFloat(formData.charge_per_day) < 0) {
            newErrors.charge_per_day = "Valid charge per day is required";
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

        router.post("/beds", formData, {
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
            <Head title="Create Bed" />

            <div className="flex flex-col gap-4 p-4 max-w-4xl">
                {/* TOP BAR */}
                <div className="flex items-center gap-4">
                    <Link href="/beds">
                        <Button variant="outline" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">Create New Bed</h1>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Bed Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Bed Number */}
                                <div>
                                    <Label htmlFor="bed_number">
                                        Bed Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="bed_number"
                                        value={formData.bed_number}
                                        onChange={(e) =>
                                            handleChange("bed_number", e.target.value.toUpperCase())
                                        }
                                        placeholder="e.g., A-101"
                                        className={errors.bed_number ? "border-destructive" : ""}
                                    />
                                    {errors.bed_number && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.bed_number}
                                        </p>
                                    )}
                                </div>

                                {/* Ward */}
                                <div>
                                    <Label htmlFor="ward_id">
                                        Ward <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.ward_id}
                                        onValueChange={(value) =>
                                            handleChange("ward_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={errors.ward_id ? "border-destructive" : ""}
                                        >
                                            <SelectValue placeholder="Select Ward" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards?.map((ward: any) => (
                                                <SelectItem
                                                    key={ward.id}
                                                    value={ward.id.toString()}
                                                    disabled={!ward.is_active}
                                                >
                                                    {ward.name} - Floor {ward.floor_number} ({ward.type})
                                                    {!ward.is_active && " - Inactive"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ward_id && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.ward_id}
                                        </p>
                                    )}
                                </div>

                                {/* Ward Details Card */}
                                {selectedWard && (
                                    <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                                        <h3 className="font-semibold mb-2">
                                            Ward Details
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Ward Name
                                                </p>
                                                <p className="font-medium">
                                                    {selectedWard.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Type
                                                </p>
                                                <p className="font-medium">
                                                    {selectedWard.type}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Floor
                                                </p>
                                                <p className="font-medium">
                                                    Floor {selectedWard.floor_number}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Total Beds
                                                </p>
                                                <p className="font-medium">
                                                    {selectedWard.beds_count || 0} / {selectedWard.total_beds}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedWard.department && (
                                            <div className="mt-3">
                                                <p className="text-muted-foreground text-sm">
                                                    Department
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {selectedWard.department.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Charge Per Day */}
                                <div>
                                    <Label htmlFor="charge_per_day">
                                        Charge Per Day ($) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="charge_per_day"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.charge_per_day}
                                        onChange={(e) =>
                                            handleChange("charge_per_day", e.target.value)
                                        }
                                        placeholder="e.g., 150.00"
                                        className={
                                            errors.charge_per_day ? "border-destructive" : ""
                                        }
                                    />
                                    {errors.charge_per_day && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.charge_per_day}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleChange("description", e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Additional notes about this bed (e.g., features, equipment, special requirements)..."
                                    />
                                </div>
                            </div>

                            {/* INFO BOX */}
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Note
                                </h3>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• The bed will be created with "available" status by default</li>
                                    <li>• Bed number must be unique across all wards</li>
                                    <li>• The charge per day will be used for billing calculations</li>
                                </ul>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Link href="/beds">
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
                                    Create Bed
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}