"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface PageProps {
    errors: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Patients", href: "/patients" },
    { title: "Create", href: "/patients/create" },
];

export default function PatientCreate() {
    const { errors } = usePage().props as any;

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        gender: "",
        date_of_birth: "",   // UPDATED
        address: "",
        city: "",
        state: "",
        zip_code: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relation: "",
        medical_history: "",
        allergies: "",
        insurance_provider: "",
        insurance_policy_number: "",
    });

    const [openDob, setOpenDob] = useState(false);
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        setProcessing(true);
        router.post("/patients", form, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Patient" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Add New Patient</h1>

                    <Link href="/patients">
                        <Button variant="outline" className="flex gap-2">
                            <ArrowLeft size={16} />
                            Back
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-6xl">
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        {/* GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {/* First Name */}
                            <div className="flex flex-col">
                                <Label>First Name</Label>
                                <Input
                                    value={form.first_name}
                                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                />
                                {errors.first_name && <p className="text-red-600 text-sm">{errors.first_name}</p>}
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col">
                                <Label>Last Name</Label>
                                <Input
                                    value={form.last_name}
                                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                />
                                {errors.last_name && <p className="text-red-600 text-sm">{errors.last_name}</p>}
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col">
                                <Label>Phone</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <Label>Email</Label>
                                <Input
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                            </div>

                            {/* Gender */}
                            <div className="flex flex-col">
                                <Label>Gender</Label>
                                <Select onValueChange={(value) => setForm({ ...form, gender: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="text-red-600 text-sm">{errors.gender}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div className="flex flex-col">
                                <Label>Date of Birth</Label>

                                <Popover open={openDob} onOpenChange={setOpenDob}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.date_of_birth
                                                ? format(new Date(form.date_of_birth), "PPP")
                                                : "Select date"}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={form.date_of_birth ? new Date(form.date_of_birth) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setForm({
                                                        ...form,
                                                        date_of_birth: date.toISOString().split("T")[0],
                                                    });
                                                    setOpenDob(false);
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>

                                {errors.date_of_birth && (
                                    <p className="text-red-600 text-sm">{errors.date_of_birth}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="flex flex-col">
                                <Label>Address</Label>
                                <Input
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                                {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                            </div>

                            {/* City */}
                            <div className="flex flex-col">
                                <Label>City</Label>
                                <Input
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                />
                                {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                            </div>

                            {/* State */}
                            <div className="flex flex-col">
                                <Label>State</Label>
                                <Input
                                    value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                />
                                {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
                            </div>

                            {/* Zip Code */}
                            <div className="flex flex-col">
                                <Label>Zip Code</Label>
                                <Input
                                    value={form.zip_code}
                                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                                />
                            </div>

                            {/* Emergency Contact Name */}
                            <div className="flex flex-col">
                                <Label>Emergency Contact Name</Label>
                                <Input
                                    value={form.emergency_contact_name}
                                    onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                                />
                            </div>

                            {/* Emergency Contact Phone */}
                            <div className="flex flex-col">
                                <Label>Emergency Contact Phone</Label>
                                <Input
                                    value={form.emergency_contact_phone}
                                    onChange={(e) =>
                                        setForm({ ...form, emergency_contact_phone: e.target.value })
                                    }
                                />
                            </div>

                            {/* Emergency Contact Relation */}
                            <div className="flex flex-col">
                                <Label>Emergency Contact Relation</Label>
                                <Input
                                    value={form.emergency_contact_relation}
                                    onChange={(e) =>
                                        setForm({ ...form, emergency_contact_relation: e.target.value })
                                    }
                                />
                            </div>

                            {/* Medical History */}
                            <div className="flex flex-col col-span-3">
                                <Label>Medical History</Label>
                                <Input
                                    value={form.medical_history}
                                    onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                                />
                            </div>

                            {/* Allergies */}
                            <div className="flex flex-col col-span-3">
                                <Label>Allergies</Label>
                                <Input
                                    value={form.allergies}
                                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                                />
                            </div>

                            {/* Insurance Provider */}
                            <div className="flex flex-col">
                                <Label>Insurance Provider</Label>
                                <Input
                                    value={form.insurance_provider}
                                    onChange={(e) => setForm({ ...form, insurance_provider: e.target.value })}
                                />
                            </div>

                            {/* Policy Number */}
                            <div className="flex flex-col">
                                <Label>Insurance Policy Number</Label>
                                <Input
                                    value={form.insurance_policy_number}
                                    onChange={(e) =>
                                        setForm({ ...form, insurance_policy_number: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <Button
                            className="w-full flex items-center justify-center gap-2 mt-4"
                            onClick={submit}
                            disabled={processing}
                        >
                            {processing && <Loader2 className="animate-spin" size={16} />}
                            Save Patient
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
