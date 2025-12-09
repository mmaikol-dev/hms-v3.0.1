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
import { Loader2, ArrowLeft, Calendar, User, Stethoscope } from "lucide-react";
import { Link } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Appointments", href: "/appointments" },
    { title: "Create", href: "/appointments/create" },
];

export default function AppointmentsCreate() {
    const { patients, doctors, departments, errors } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        department_id: "",
        appointment_date: "",
        reason: "",
        notes: "",
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

        // Auto-select department when doctor is selected
        if (name === "doctor_id") {
            const selectedDoctor = doctors?.find(
                (d: any) => d.id.toString() === value
            );
            if (selectedDoctor?.doctor?.department_id) {
                setFormData((prev) => ({
                    ...prev,
                    department_id:
                        selectedDoctor.doctor.department_id.toString(),
                }));
            }
        }
    };

    const handleSubmit = () => {
        setProcessing(true);

        router.post("/appointments", formData, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                // Form will redirect on success
            },
        });
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split("T")[0];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Appointment" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/appointments">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Schedule New Appointment
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Book an appointment for a patient
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>
                            Fill in the appointment information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Patient & Doctor Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User size={20} />
                                    Patient & Doctor
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="patient_id">
                                            Patient{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.patient_id}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "patient_id",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="patient_id"
                                                className={
                                                    errors?.patient_id
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
                                                        {patient.first_name}{" "}
                                                        {patient.last_name} -{" "}
                                                        {patient.phone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.patient_id && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.patient_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="doctor_id">
                                            Doctor{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.doctor_id}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "doctor_id",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="doctor_id"
                                                className={
                                                    errors?.doctor_id
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
                                                        {doctor.name} -{" "}
                                                        {doctor.doctor
                                                            ?.specialization ||
                                                            "General"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.doctor_id && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.doctor_id}
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
                                                {departments?.map((dept: any) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.id.toString()}
                                                    >
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.department_id && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.department_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="appointment_date">
                                            Appointment Date{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="appointment_date"
                                            name="appointment_date"
                                            type="date"
                                            min={today}
                                            value={formData.appointment_date}
                                            onChange={handleInputChange}
                                            className={
                                                errors?.appointment_date
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors?.appointment_date && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.appointment_date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Stethoscope size={20} />
                                    Appointment Information
                                </h3>

                                <div>
                                    <Label htmlFor="reason">
                                        Reason for Visit
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of the reason for visit..."
                                        rows={3}
                                        className={
                                            errors?.reason
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors?.reason && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="notes">
                                        Additional Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any additional information or special requirements..."
                                        rows={3}
                                        className={
                                            errors?.notes
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors?.notes && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex gap-2">
                                    <Calendar className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            Appointment Information
                                        </p>
                                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                                            An appointment number and token will
                                            be automatically generated upon
                                            creation. The patient will receive
                                            their token number for queue
                                            management.
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
                                    Create Appointment
                                </Button>
                                <Link href="/appointments" className="flex-1">
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