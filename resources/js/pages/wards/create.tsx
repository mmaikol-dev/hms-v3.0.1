"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage, Link } from "@inertiajs/react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Wards", href: "/wards" },
    { title: "Create", href: "/wards/create" },
];

const wardTypes = [
    { value: "general", label: "General Ward" },
    { value: "private", label: "Private Ward" },
    { value: "icu", label: "ICU (Intensive Care Unit)" },
    { value: "emergency", label: "Emergency Ward" },
    { value: "maternity", label: "Maternity Ward" },
    { value: "pediatric", label: "Pediatric Ward" },
];

interface FormData {
    name: string;
    type: string;
    floor_number: string;
    total_beds: string;
    department_id: string;
    is_active: boolean;
}

interface FormErrors {
    [key: string]: string;
}

export default function WardCreate() {
    const { departments } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState<FormData>({
        name: "",
        type: "",
        floor_number: "",
        total_beds: "",
        department_id: "",
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

        if (!formData.name.trim()) {
            newErrors.name = "Ward name is required";
        }

        if (!formData.type) {
            newErrors.type = "Ward type is required";
        }

        if (!formData.floor_number || parseInt(formData.floor_number) < 0) {
            newErrors.floor_number = "Valid floor number is required";
        }

        if (!formData.total_beds || parseInt(formData.total_beds) < 1) {
            newErrors.total_beds = "Total beds must be at least 1";
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

        const submitData = {
            ...formData,
            department_id: formData.department_id || null,
        };

        router.post("/wards", submitData, {
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
            <Head title="Create Ward" />

            <div className="flex flex-col gap-4 p-4 max-w-4xl">
                {/* TOP BAR */}
                <div className="flex items-center gap-4">
                    <Link href="/wards">
                        <Button variant="outline" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">Create New Ward</h1>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ward Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Ward Name */}
                                <div>
                                    <Label htmlFor="name">
                                        Ward Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleChange("name", e.target.value)
                                        }
                                        placeholder="e.g., East Wing Ward A"
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Ward Type */}
                                <div>
                                    <Label htmlFor="type">
                                        Ward Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) =>
                                            handleChange("type", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={errors.type ? "border-destructive" : ""}
                                        >
                                            <SelectValue placeholder="Select Ward Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wardTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                {/* Floor Number */}
                                <div>
                                    <Label htmlFor="floor_number">
                                        Floor Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="floor_number"
                                        type="number"
                                        min="0"
                                        value={formData.floor_number}
                                        onChange={(e) =>
                                            handleChange("floor_number", e.target.value)
                                        }
                                        placeholder="e.g., 3"
                                        className={
                                            errors.floor_number ? "border-destructive" : ""
                                        }
                                    />
                                    {errors.floor_number && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.floor_number}
                                        </p>
                                    )}
                                </div>

                                {/* Total Beds */}
                                <div>
                                    <Label htmlFor="total_beds">
                                        Total Beds <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="total_beds"
                                        type="number"
                                        min="1"
                                        value={formData.total_beds}
                                        onChange={(e) =>
                                            handleChange("total_beds", e.target.value)
                                        }
                                        placeholder="e.g., 20"
                                        className={
                                            errors.total_beds ? "border-destructive" : ""
                                        }
                                    />
                                    {errors.total_beds && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.total_beds}
                                        </p>
                                    )}
                                </div>

                                {/* Department */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="department_id">
                                        Department (Optional)
                                    </Label>
                                    <Select
                                        value={formData.department_id}
                                        onValueChange={(value) =>
                                            handleChange("department_id", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {departments?.map((dept: any) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-2 pt-2">
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
                                        Active (available for admissions)
                                    </Label>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Link href="/wards">
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
                                    Create Ward
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}