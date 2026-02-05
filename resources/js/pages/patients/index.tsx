"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Search,
    Edit,
    Trash,
    User2,
    Loader2,
    CheckCircle2,
    XCircle,
    Phone,
    Mail,
    MoreVertical,
    Calendar,
    Users,
    MapPin,
    Droplet
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Patients", href: "/patients" },
];

export default function PatientsIndex() {
    const { patients, flash } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingPatient, setEditingPatient] = useState<any>(null);
    const [errors, setErrors] = useState({});

    // SUCCESS/ERROR MODAL STATE
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setModalMessage(flash.success);
            setShowSuccessModal(true);
            setErrors({});
        }
        if (flash?.error) {
            setModalMessage(flash.error);
            setShowErrorModal(true);
        }
    }, [flash]);

    const handleSearch = () => {
        router.get(
            "/patients",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (patient: any) => {
        const formattedPatient = { ...patient };
        if (patient.date_of_birth) {
            formattedPatient.date_of_birth = patient.date_of_birth.split('T')[0];
        }
        setEditingPatient(formattedPatient);
        setOpenEdit(true);
        setErrors({});
    };

    const submitEdit = () => {
        if (!editingPatient) return;

        setProcessing(true);

        const submitData = {
            first_name: editingPatient.first_name,
            last_name: editingPatient.last_name,
            email: editingPatient.email || null,
            phone: editingPatient.phone,
            date_of_birth: editingPatient.date_of_birth || null,
            gender: editingPatient.gender,
            blood_group: editingPatient.blood_group || null,
            address: editingPatient.address || null,
            national_id: editingPatient.national_id || null,
            city: editingPatient.city || null,
            state: editingPatient.state || null,
            zip_code: editingPatient.zip_code || null,
            emergency_contact_name: editingPatient.emergency_contact_name || null,
            emergency_contact_phone: editingPatient.emergency_contact_phone || null,
            emergency_contact_relation: editingPatient.emergency_contact_relation || null,
            medical_history: editingPatient.medical_history || null,
            allergies: editingPatient.allergies || null,
            insurance_provider: editingPatient.insurance_provider || null,
            insurance_policy_number: editingPatient.insurance_policy_number || null,
            file_no: editingPatient.file_no || null,
        };

        router.put(`/patients/${editingPatient.id}`, submitData, {
            preserveScroll: true,
            onSuccess: () => {
                setOpenEdit(false);
                setEditingPatient(null);
            },
            onError: (errors) => {
                setErrors(errors);
                const errorMessages = Object.values(errors).flat().join(', ');
                setModalMessage(errorMessages);
                setShowErrorModal(true);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getAvatarGradient = (name: string) => {
        const gradients = [
            'bg-gradient-to-br from-blue-400 to-blue-600',
            'bg-gradient-to-br from-purple-400 to-purple-600',
            'bg-gradient-to-br from-pink-400 to-pink-600',
            'bg-gradient-to-br from-green-400 to-green-600',
            'bg-gradient-to-br from-yellow-400 to-yellow-600',
            'bg-gradient-to-br from-indigo-400 to-indigo-600',
            'bg-gradient-to-br from-red-400 to-red-600',
            'bg-gradient-to-br from-teal-400 to-teal-600',
        ];
        const index = name.charCodeAt(0) % gradients.length;
        return gradients[index];
    };

    const getGenderColor = (gender: string) => {
        const colors = {
            male: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
            female: 'text-pink-600 bg-pink-50 dark:bg-pink-950 dark:text-pink-400',
            other: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
        };
        return colors[gender.toLowerCase()] || colors.other;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients" />

            <div className="flex flex-col gap-6 p-6">
                {/* TOP BAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Patients
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and view all patient records
                        </p>
                    </div>

                    <Link href="/patients/create">
                        <Button className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                            <Plus size={18} />
                            Add New Patient
                        </Button>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="flex gap-3 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9 shadow-sm"
                        />
                    </div>
                    <Button onClick={handleSearch} variant="secondary" className="shadow-sm">
                        Search
                    </Button>
                </div>

                {/* CARDS GRID */}
                {!patients ? (
                    // LOADING STATE
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : patients.data.length === 0 ? (
                    <Card className="shadow-md">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4 mb-4">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No patients found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get started by adding your first patient
                            </p>
                            <Link href="/patients/create">
                                <Button variant="outline" className="gap-2">
                                    <Plus size={16} />
                                    Add Patient
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {patients.data.map((p: any) => (
                                <Card
                                    key={p.id}
                                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <Avatar
                                                className={`h-12 w-12 ${getAvatarGradient(p.first_name)} shadow-md ring-2 ring-background`}
                                            >
                                                <AvatarFallback className="text-white font-semibold bg-transparent">
                                                    {getInitials(p.first_name, p.last_name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                {/* Name & File */}
                                                <Link href={`/patients/${p.id}`}>
                                                    <h3 className="font-semibold text-base leading-tight hover:text-primary transition-colors mb-1">
                                                        {p.first_name} {p.last_name}
                                                    </h3>
                                                </Link>
                                                {p.file_no && (
                                                    <p className="text-xs text-muted-foreground mb-3">
                                                        File #{p.file_no}
                                                    </p>
                                                )}

                                                {/* Contact Info */}
                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10">
                                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                                        </div>
                                                        <span className="text-muted-foreground">{p.phone}</span>
                                                    </div>

                                                    {p.email && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10">
                                                                <Mail className="h-3.5 w-3.5 text-primary" />
                                                            </div>
                                                            <span className="text-muted-foreground truncate">{p.email}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Badges & Info */}
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <Badge variant="secondary" className={`text-xs font-medium ${getGenderColor(p.gender)}`}>
                                                        {p.gender}
                                                    </Badge>

                                                    {p.blood_group && (
                                                        <Badge variant="outline" className="text-xs font-medium border-red-200 text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400">
                                                            <Droplet className="h-3 w-3 mr-1" />
                                                            {p.blood_group}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Additional Info */}
                                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                                    {p.city && (
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{p.city}{p.state ? `, ${p.state}` : ''}</span>
                                                        </div>
                                                    )}
                                                    {p.last_visit && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Last visit: {p.last_visit}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions Menu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/patients/${p.id}`} className="cursor-pointer">
                                                            <User2 className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(p)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Information
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.delete(`/patients/${p.id}`, {
                                                                preserveScroll: true,
                                                                onBefore: () => {
                                                                    return confirm('Are you sure you want to delete this patient?');
                                                                }
                                                            })
                                                        }
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete Patient
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium text-foreground">{patients.from}</span> to{" "}
                                <span className="font-medium text-foreground">{patients.to}</span> of{" "}
                                <span className="font-medium text-foreground">{patients.total}</span> patients
                            </p>

                            <div className="flex gap-1">
                                {patients.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        disabled={!link.url}
                                        className={`min-w-[36px] h-9 px-3 text-sm rounded-lg border transition-all ${link.active
                                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                : !link.url
                                                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                                                    : "hover:bg-muted hover:border-primary/30"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ===========================
                EDIT MODAL
            ============================ */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Edit Patient Information</DialogTitle>
                    </DialogHeader>

                    {editingPatient && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">File Number</Label>
                                <Input
                                    value={editingPatient.file_no ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            file_no: e.target.value,
                                        })
                                    }
                                    placeholder="Enter file number"
                                />
                                {errors.file_no && (
                                    <p className="text-xs text-red-500">{errors.file_no}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">First Name *</Label>
                                <Input
                                    value={editingPatient.first_name}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            first_name: e.target.value,
                                        })
                                    }
                                />
                                {errors.first_name && (
                                    <p className="text-xs text-red-500">{errors.first_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Last Name *</Label>
                                <Input
                                    value={editingPatient.last_name}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            last_name: e.target.value,
                                        })
                                    }
                                />
                                {errors.last_name && (
                                    <p className="text-xs text-red-500">{errors.last_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Phone Number *</Label>
                                <Input
                                    value={editingPatient.phone}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Email Address</Label>
                                <Input
                                    type="email"
                                    value={editingPatient.email ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            email: e.target.value,
                                        })
                                    }
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={editingPatient.date_of_birth ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            date_of_birth: e.target.value,
                                        })
                                    }
                                />
                                {errors.date_of_birth && (
                                    <p className="text-xs text-red-500">{errors.date_of_birth}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Gender *</Label>
                                <Select
                                    value={editingPatient.gender}
                                    onValueChange={(value) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            gender: value,
                                        })
                                    }
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
                                {errors.gender && (
                                    <p className="text-xs text-red-500">{errors.gender}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Blood Group</Label>
                                <Select
                                    value={editingPatient.blood_group || ""}
                                    onValueChange={(value) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            blood_group: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-medium">Address</Label>
                                <Input
                                    value={editingPatient.address ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            address: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">National ID</Label>
                                <Input
                                    value={editingPatient.national_id ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            national_id: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">City</Label>
                                <Input
                                    value={editingPatient.city ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            city: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">State</Label>
                                <Input
                                    value={editingPatient.state ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            state: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Zip Code</Label>
                                <Input
                                    value={editingPatient.zip_code ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            zip_code: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-medium">Medical History</Label>
                                <Textarea
                                    value={editingPatient.medical_history ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            medical_history: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-medium">Allergies</Label>
                                <Textarea
                                    value={editingPatient.allergies ?? ""}
                                    onChange={(e) =>
                                        setEditingPatient({
                                            ...editingPatient,
                                            allergies: e.target.value,
                                        })
                                    }
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setOpenEdit(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===========================
                SUCCESS MODAL
            ============================ */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <DialogTitle>Success</DialogTitle>
                        </div>
                    </DialogHeader>
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {modalMessage}
                        </AlertDescription>
                    </Alert>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setShowSuccessModal(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===========================
                ERROR MODAL
            ============================ */}
            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle>Error</DialogTitle>
                        </div>
                    </DialogHeader>
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            {modalMessage}
                        </AlertDescription>
                    </Alert>
                    <div className="flex justify-end mt-4">
                        <Button
                            variant="destructive"
                            onClick={() => setShowErrorModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}