"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Departments", href: "/departments" },
    { title: "Create", href: "/departments/create" },
];

export default function DepartmentsCreate() {
    const { errors } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        head_of_department: "",
        phone: "",
        is_active: true,
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        setProcessing(true);

        router.post("/departments", formData, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                // Form will redirect on success
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Department" />

            <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/departments">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Add New Department
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new hospital department
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Information</CardTitle>
                        <CardDescription>
                            Enter the department details and contact information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">
                                        Department Name{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Cardiology, Emergency, Surgery"
                                        className={
                                            errors?.name
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors?.name && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of the department and its services..."
                                        rows={4}
                                        className={
                                            errors?.description
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors?.description && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">
                                    Contact Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="head_of_department">
                                            Head of Department
                                        </Label>
                                        <Input
                                            id="head_of_department"
                                            name="head_of_department"
                                            value={formData.head_of_department}
                                            onChange={handleInputChange}
                                            placeholder="Dr. John Doe"
                                            className={
                                                errors?.head_of_department
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.head_of_department && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.head_of_department}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+1234567890"
                                            className={
                                                errors?.phone
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.phone && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                is_active: checked,
                                            }))
                                        }
                                    />
                                    <div>
                                        <Label
                                            htmlFor="is_active"
                                            className="mb-0"
                                        >
                                            Department is Active
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Inactive departments won't be
                                            available for appointments
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing && (
                                        <Loader2
                                            className="mr-2 animate-spin"
                                            size={16}
                                        />
                                    )}
                                    Create Department
                                </Button>
                                <Link href="/departments" className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}