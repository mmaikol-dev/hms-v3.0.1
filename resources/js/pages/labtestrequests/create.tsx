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
    { title: "Lab Test Requests", href: "/labtestrequests" },
    { title: "Create", href: "/labtestrequests/create" },
];

interface FormData {
    patient_id: string;
    doctor_id: string;
    lab_test_id: string;
    requested_date: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function LabTestRequestCreate() {
    const { patients, doctors, labTests } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [selectedTest, setSelectedTest] = useState<any>(null);

    const [formData, setFormData] = useState<FormData>({
        patient_id: "",
        doctor_id: "",
        lab_test_id: "",
        requested_date: new Date().toISOString().slice(0, 16),
        notes: "",
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

        // Update selected test details
        if (field === "lab_test_id") {
            const test = labTests?.find((t: any) => t.id.toString() === value);
            setSelectedTest(test || null);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.patient_id) {
            newErrors.patient_id = "Patient is required";
        }

        if (!formData.doctor_id) {
            newErrors.doctor_id = "Doctor is required";
        }

        if (!formData.lab_test_id) {
            newErrors.lab_test_id = "Lab test is required";
        }

        if (!formData.requested_date) {
            newErrors.requested_date = "Requested date is required";
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

        router.post("/labtestrequests", formData, {
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
            <Head title="Create Lab Test Request" />

            <div className="flex flex-col gap-4 p-4 max-w-4xl">
                {/* TOP BAR */}
                <div className="flex items-center gap-4">
                    <Link href="/labtestrequests">
                        <Button variant="outline" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">
                        Create Lab Test Request
                    </h1>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Patient */}
                                <div>
                                    <Label htmlFor="patient_id">
                                        Patient{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.patient_id}
                                        onValueChange={(value) =>
                                            handleChange("patient_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.patient_id
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Select Patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients?.map((patient: any) => (
                                                <SelectItem
                                                    key={patient.id}
                                                    value={patient.id.toString()}
                                                >
                                                    {patient.first_name} {patient.last_name} - {patient.patient_id}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.patient_id}
                                        </p>
                                    )}
                                </div>

                                {/* Doctor */}
                                <div>
                                    <Label htmlFor="doctor_id">
                                        Requesting Doctor{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.doctor_id}
                                        onValueChange={(value) =>
                                            handleChange("doctor_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.doctor_id
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Select Doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors?.map((doctor: any) => (
                                                <SelectItem
                                                    key={doctor.id}
                                                    value={doctor.id.toString()}
                                                >
                                                    Dr. {doctor.user?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.doctor_id && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.doctor_id}
                                        </p>
                                    )}
                                </div>

                                {/* Lab Test */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="lab_test_id">
                                        Lab Test{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.lab_test_id}
                                        onValueChange={(value) =>
                                            handleChange("lab_test_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.lab_test_id
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Select Lab Test" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {labTests?.map((test: any) => (
                                                <SelectItem
                                                    key={test.id}
                                                    value={test.id.toString()}
                                                >
                                                    {test.test_name} ({test.test_code}) - $
                                                    {test.price}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.lab_test_id && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.lab_test_id}
                                        </p>
                                    )}
                                </div>

                                {/* Test Details Card */}
                                {selectedTest && (
                                    <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                                        <h3 className="font-semibold mb-2">
                                            Test Details
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Category
                                                </p>
                                                <p className="font-medium">
                                                    {selectedTest.category}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Price
                                                </p>
                                                <p className="font-medium">
                                                    ${selectedTest.price}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Duration
                                                </p>
                                                <p className="font-medium">
                                                    {selectedTest.normal_duration_hours}{" "}
                                                    hours
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Status
                                                </p>
                                                <p className="font-medium">
                                                    {selectedTest.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedTest.description && (
                                            <div className="mt-3">
                                                <p className="text-muted-foreground text-sm">
                                                    Description
                                                </p>
                                                <p className="text-sm">
                                                    {selectedTest.description}
                                                </p>
                                            </div>
                                        )}

                                        {selectedTest.preparation_instructions && (
                                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900">
                                                <p className="font-medium text-sm mb-1 text-blue-900 dark:text-blue-100">
                                                    Preparation Instructions
                                                </p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    {
                                                        selectedTest.preparation_instructions
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Requested Date */}
                                <div>
                                    <Label htmlFor="requested_date">
                                        Requested Date{" "}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="requested_date"
                                        type="datetime-local"
                                        value={formData.requested_date}
                                        onChange={(e) =>
                                            handleChange(
                                                "requested_date",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            errors.requested_date
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors.requested_date && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.requested_date}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) =>
                                            handleChange("notes", e.target.value)
                                        }
                                        rows={4}
                                        placeholder="Add any additional notes or special instructions..."
                                    />
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Link href="/labtestrequests">
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
                                    Create Request
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}