"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarIcon, Loader2, Menu, ChevronRight } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        file_no: "", // Added file_no
        member_no: "", // Added member_no
        phone: "",
        email: "",
        gender: "",
        date_of_birth: "",
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
    const [openMobileDob, setOpenMobileDob] = useState(false); // Separate state for mobile
    const [processing, setProcessing] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");

    const submit = () => {
        setProcessing(true);
        router.post("/patients", form, {
            onFinish: () => setProcessing(false),
        });
    };

    // Mobile Navigation Sections - Added identifiers section
    const sections = [
        { id: "personal", title: "Personal Info", icon: "👤" },
        { id: "identifiers", title: "Identifiers", icon: "🔢" }, // New section
        { id: "contact", title: "Contact Info", icon: "📱" },
        { id: "emergency", title: "Emergency Contact", icon: "🆘" },
        { id: "medical", title: "Medical Info", icon: "🏥" },
        { id: "insurance", title: "Insurance", icon: "📄" },
    ];

    // Format date for display
    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return "Select date";
        try {
            return format(new Date(dateString + 'T00:00:00'), "PPP");
        } catch (error) {
            return "Select date";
        }
    };

    // Handle date selection
    const handleDateSelect = (date: Date | undefined, isMobile: boolean = false) => {
        if (date) {
            // Format as YYYY-MM-DD for Laravel/backend
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            setForm({
                ...form,
                date_of_birth: formattedDate,
            });

            if (isMobile) {
                setOpenMobileDob(false);
            } else {
                setOpenDob(false);
            }
        }
    };

    // Date picker component for reuse - UPDATED WITH NEW CALENDAR CONFIGURATION
    const DatePickerField = ({ isMobile = false }: { isMobile?: boolean }) => {
        const openState = isMobile ? openMobileDob : openDob;
        const setOpenState = isMobile ? setOpenMobileDob : setOpenDob;

        return (
            <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover open={openState} onOpenChange={setOpenState}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => setOpenState(true)}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDateForDisplay(form.date_of_birth)}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={form.date_of_birth ? new Date(form.date_of_birth + 'T00:00:00') : undefined}
                            onSelect={(date) => handleDateSelect(date, isMobile)}
                            initialFocus
                            // ADDED: captionLayout="dropdown" for better UX
                            captionLayout="dropdown"
                            // OPTIONAL: Add some styling to match your design
                            className="rounded-md border shadow-sm"
                            // OPTIONAL: Set year range for dropdowns (1900-current year + 10)
                            fromYear={1900}
                            toYear={new Date().getFullYear() + 10}
                        />
                    </PopoverContent>
                </Popover>
                {errors.date_of_birth && (
                    <p className="text-red-600 text-sm">{errors.date_of_birth}</p>
                )}
            </div>
        );
    };

    // Mobile Section Renderer
    const renderMobileSection = () => {
        switch (activeSection) {
            case "personal":
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Personal Information</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>First Name *</Label>
                                <Input
                                    value={form.first_name}
                                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                    placeholder="Enter first name"
                                />
                                {errors.first_name && <p className="text-red-600 text-sm">{errors.first_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name *</Label>
                                <Input
                                    value={form.last_name}
                                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                    placeholder="Enter last name"
                                />
                                {errors.last_name && <p className="text-red-600 text-sm">{errors.last_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select
                                    value={form.gender}
                                    onValueChange={(value) => setForm({ ...form, gender: value })}
                                >
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

                            <DatePickerField isMobile={true} />
                        </div>
                    </div>
                );

            case "identifiers": // New identifiers section for mobile
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Identifiers</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>File Number</Label>
                                <Input
                                    value={form.file_no}
                                    onChange={(e) => setForm({ ...form, file_no: e.target.value })}
                                    placeholder="Enter file number"
                                />
                                {errors.file_no && <p className="text-red-600 text-sm">{errors.file_no}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Member Number</Label>
                                <Input
                                    value={form.member_no}
                                    onChange={(e) => setForm({ ...form, member_no: e.target.value })}
                                    placeholder="Enter member number"
                                />
                                {errors.member_no && <p className="text-red-600 text-sm">{errors.member_no}</p>}
                            </div>
                        </div>
                    </div>
                );

            case "contact":
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Phone *</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Enter street address"
                                />
                                {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        placeholder="City"
                                    />
                                    {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        placeholder="State"
                                    />
                                    {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Zip Code</Label>
                                <Input
                                    value={form.zip_code}
                                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                                    placeholder="Zip code"
                                />
                            </div>
                        </div>
                    </div>
                );

            case "emergency":
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Emergency Contact</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Contact Name</Label>
                                <Input
                                    value={form.emergency_contact_name}
                                    onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                                    placeholder="Full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Contact Phone</Label>
                                <Input
                                    value={form.emergency_contact_phone}
                                    onChange={(e) =>
                                        setForm({ ...form, emergency_contact_phone: e.target.value })
                                    }
                                    placeholder="Phone number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input
                                    value={form.emergency_contact_relation}
                                    onChange={(e) =>
                                        setForm({ ...form, emergency_contact_relation: e.target.value })
                                    }
                                    placeholder="Relationship to patient"
                                />
                            </div>
                        </div>
                    </div>
                );

            case "medical":
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Medical Information</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Medical History</Label>
                                <Textarea
                                    value={form.medical_history}
                                    onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                                    rows={3}
                                    className="resize-none"
                                    placeholder="Any relevant medical history"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Allergies</Label>
                                <Textarea
                                    value={form.allergies}
                                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                                    rows={2}
                                    className="resize-none"
                                    placeholder="Any known allergies"
                                />
                            </div>
                        </div>
                    </div>
                );

            case "insurance":
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Insurance Information</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Insurance Provider</Label>
                                <Input
                                    value={form.insurance_provider}
                                    onChange={(e) => setForm({ ...form, insurance_provider: e.target.value })}
                                    placeholder="Insurance company name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Policy Number</Label>
                                <Input
                                    value={form.insurance_policy_number}
                                    onChange={(e) =>
                                        setForm({ ...form, insurance_policy_number: e.target.value })
                                    }
                                    placeholder="Policy/member number"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Patient" />

            <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4">
                {/* MOBILE HEADER */}
                <div className="flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit("/patients")}
                            className="h-8 w-8"
                        >
                            <ArrowLeft size={16} />
                        </Button>
                        <h1 className="text-lg font-semibold">New Patient</h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={submit}
                        disabled={processing}
                        className="h-8 px-3"
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Add New Patient</h1>
                    <Link href="/patients">
                        <Button variant="outline" className="flex gap-2">
                            <ArrowLeft size={16} />
                            Back to Patients
                        </Button>
                    </Link>
                </div>

                {/* MOBILE STEP NAVIGATION */}
                <div className="md:hidden">
                    <ScrollArea className="w-full">
                        <div className="flex space-x-2 pb-2">
                            {sections.map((section) => (
                                <Button
                                    key={section.id}
                                    variant={activeSection === section.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveSection(section.id)}
                                    className="flex-shrink-0 h-9 px-3 whitespace-nowrap"
                                >
                                    <span className="mr-1">{section.icon}</span>
                                    {section.title}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* MOBILE FORM LAYOUT */}
                <div className="md:hidden">
                    <Card>
                        <CardContent className="pt-6">
                            <ScrollArea className="h-[calc(100vh-180px)]">
                                <div className="space-y-6 pb-20">
                                    {renderMobileSection()}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* MOBILE FLOATING ACTIONS */}
                <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
                    <Card className="shadow-lg">
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Section {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
                                    </div>
                                    <div className="font-medium">
                                        {sections.find(s => s.id === activeSection)?.title}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {activeSection !== "personal" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const currentIndex = sections.findIndex(s => s.id === activeSection);
                                                if (currentIndex > 0) {
                                                    setActiveSection(sections[currentIndex - 1].id);
                                                }
                                            }}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {activeSection !== "insurance" ? (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                const currentIndex = sections.findIndex(s => s.id === activeSection);
                                                if (currentIndex < sections.length - 1) {
                                                    setActiveSection(sections[currentIndex + 1].id);
                                                }
                                            }
                                            }
                                        >
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={submit}
                                            disabled={processing}
                                            className="gap-2"
                                        >
                                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Save Patient
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* DESKTOP FORM LAYOUT */}
                <div className="hidden md:block">
                    <Card className="max-w-6xl">
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name *</Label>
                                        <Input
                                            value={form.first_name}
                                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                            placeholder="Enter first name"
                                        />
                                        {errors.first_name && <p className="text-red-600 text-sm">{errors.first_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Last Name *</Label>
                                        <Input
                                            value={form.last_name}
                                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                            placeholder="Enter last name"
                                        />
                                        {errors.last_name && <p className="text-red-600 text-sm">{errors.last_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Phone *</Label>
                                        <Input
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                        />
                                        {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select
                                            value={form.gender}
                                            onValueChange={(value) => setForm({ ...form, gender: value })}
                                        >
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

                                    <DatePickerField />
                                </div>
                            </div>

                            {/* Identifiers Section - Added for desktop */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Identifiers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>File Number</Label>
                                        <Input
                                            value={form.file_no}
                                            onChange={(e) => setForm({ ...form, file_no: e.target.value })}
                                            placeholder="Enter file number"
                                        />
                                        {errors.file_no && <p className="text-red-600 text-sm">{errors.file_no}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Member Number</Label>
                                        <Input
                                            value={form.member_no}
                                            onChange={(e) => setForm({ ...form, member_no: e.target.value })}
                                            placeholder="Enter member number"
                                        />
                                        {errors.member_no && <p className="text-red-600 text-sm">{errors.member_no}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-3 space-y-2">
                                        <Label>Address</Label>
                                        <Input
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            placeholder="Enter street address"
                                        />
                                        {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input
                                            value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            placeholder="City"
                                        />
                                        {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input
                                            value={form.state}
                                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                                            placeholder="State"
                                        />
                                        {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Zip Code</Label>
                                        <Input
                                            value={form.zip_code}
                                            onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                                            placeholder="Zip code"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Contact Name</Label>
                                        <Input
                                            value={form.emergency_contact_name}
                                            onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                                            placeholder="Full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Contact Phone</Label>
                                        <Input
                                            value={form.emergency_contact_phone}
                                            onChange={(e) =>
                                                setForm({ ...form, emergency_contact_phone: e.target.value })
                                            }
                                            placeholder="Phone number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Relationship</Label>
                                        <Input
                                            value={form.emergency_contact_relation}
                                            onChange={(e) =>
                                                setForm({ ...form, emergency_contact_relation: e.target.value })
                                            }
                                            placeholder="Relationship to patient"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Medical Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Medical Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Medical History</Label>
                                        <Textarea
                                            value={form.medical_history}
                                            onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                                            rows={3}
                                            className="resize-none"
                                            placeholder="Any relevant medical history"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Allergies</Label>
                                        <Textarea
                                            value={form.allergies}
                                            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                                            rows={2}
                                            className="resize-none"
                                            placeholder="Any known allergies"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Insurance Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Insurance Provider</Label>
                                        <Input
                                            value={form.insurance_provider}
                                            onChange={(e) => setForm({ ...form, insurance_provider: e.target.value })}
                                            placeholder="Insurance company name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Policy Number</Label>
                                        <Input
                                            value={form.insurance_policy_number}
                                            onChange={(e) =>
                                                setForm({ ...form, insurance_policy_number: e.target.value })
                                            }
                                            placeholder="Policy/member number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 border-t">
                                <Button
                                    className="w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2"
                                    onClick={submit}
                                    disabled={processing}
                                    size="lg"
                                >
                                    {processing && <Loader2 className="animate-spin" size={16} />}
                                    Save Patient
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}