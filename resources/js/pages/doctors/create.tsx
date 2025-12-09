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
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Doctors", href: "/doctors" },
    { title: "Create", href: "/doctors/create" },
];

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function DoctorsCreate() {
    const { departments, users, errors } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        user_id: "",
        department_id: "",
        specialization: "",
        qualification: "",
        consultation_fee: "",
        biography: "",
        experience_years: "",
        available_days: [] as string[],
        shift_start: "",
        shift_end: "",
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

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const toggleDay = (day: string) => {
        setFormData((prev) => ({
            ...prev,
            available_days: prev.available_days.includes(day)
                ? prev.available_days.filter((d) => d !== day)
                : [...prev.available_days, day],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post("/doctors", formData, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                // Form will redirect on success
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Doctor" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/doctors">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Add New Doctor</h1>
                        <p className="text-sm text-muted-foreground">
                            Fill in the details to register a new doctor
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Doctor Information</CardTitle>
                        <CardDescription>
                            Enter the doctor's professional details and schedule
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="user_id">
                                            User Account{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.user_id}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "user_id",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="user_id"
                                                className={
                                                    errors?.user_id
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            >
                                                <SelectValue placeholder="Select User" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users?.map((user: any) => (
                                                    <SelectItem
                                                        key={user.id}
                                                        value={user.id.toString()}
                                                    >
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.user_id && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.user_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="department_id">
                                            Department{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.department_id}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "department_id",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="department_id"
                                                className={
                                                    errors?.department_id
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            >
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments?.map(
                                                    (dept: any) => (
                                                        <SelectItem
                                                            key={dept.id}
                                                            value={dept.id.toString()}
                                                        >
                                                            {dept.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors?.department_id && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.department_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="specialization">
                                            Specialization{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="specialization"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Cardiology"
                                            className={
                                                errors?.specialization
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.specialization && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.specialization}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="qualification">
                                            Qualification{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="qualification"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleInputChange}
                                            placeholder="e.g. MBBS, MD"
                                            className={
                                                errors?.qualification
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.qualification && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.qualification}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="consultation_fee">
                                            Consultation Fee{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="consultation_fee"
                                            name="consultation_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.consultation_fee}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            className={
                                                errors?.consultation_fee
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.consultation_fee && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.consultation_fee}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="experience_years">
                                            Experience (Years)
                                        </Label>
                                        <Input
                                            id="experience_years"
                                            name="experience_years"
                                            type="number"
                                            min="0"
                                            value={formData.experience_years}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            className={
                                                errors?.experience_years
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.experience_years && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.experience_years}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="biography">Biography</Label>
                                    <Textarea
                                        id="biography"
                                        name="biography"
                                        value={formData.biography}
                                        onChange={handleInputChange}
                                        placeholder="Brief professional biography..."
                                        rows={4}
                                        className={
                                            errors?.biography
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors?.biography && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.biography}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Information */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold">
                                    Schedule & Availability
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="shift_start">
                                            Shift Start Time
                                        </Label>
                                        <Input
                                            id="shift_start"
                                            name="shift_start"
                                            type="time"
                                            value={formData.shift_start}
                                            onChange={handleInputChange}
                                            className={
                                                errors?.shift_start
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.shift_start && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.shift_start}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="shift_end">
                                            Shift End Time
                                        </Label>
                                        <Input
                                            id="shift_end"
                                            name="shift_end"
                                            type="time"
                                            value={formData.shift_end}
                                            onChange={handleInputChange}
                                            className={
                                                errors?.shift_end
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.shift_end && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.shift_end}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-3 block">
                                        Available Days
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeek.map((day) => (
                                            <Button
                                                key={day}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    formData.available_days.includes(
                                                        day
                                                    )
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() => toggleDay(day)}
                                            >
                                                {day}
                                            </Button>
                                        ))}
                                    </div>
                                    {errors?.available_days && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.available_days}
                                        </p>
                                    )}
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
                                    Create Doctor
                                </Button>
                                <Link href="/doctors" className="flex-1">
                                    <Button
                                        type="button"
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