"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    Edit,
    Trash,
    Calendar,
    Clock,
    LogIn,
    LogOut,
    Eye,
    Loader2,
    Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Appointments", href: "/appointments" },
];

const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
};

export default function AppointmentsIndex() {
    const { appointments, patients, doctors, departments } =
        usePage().props as any;

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState<any>(null);

    const handleSearch = () => {
        router.get("/appointments", {
            search,
            status: filterStatus === "all" ? "" : filterStatus,
            date: filterDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });

    };

    const openEditModal = (appointment: any) => {
        setEditingAppointment({ ...appointment });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingAppointment) return;

        setProcessing(true);

        router.put(
            `/appointments/${editingAppointment.id}`,
            editingAppointment,
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setOpenEdit(false);
                },
            }
        );
    };

    const viewAppointment = async (appointment: any) => {
        try {
            const response = await fetch(`/appointments/${appointment.id}`);
            const data = await response.json();
            setViewingAppointment(data);
            setOpenView(true);
        } catch (error) {
            console.error("Error fetching appointment:", error);
        }
    };

    const handleCheckIn = (id: number) => {
        router.post(`/appointments/${id}/check-in`, {}, {
            preserveScroll: true,
        });
    };

    const handleCheckOut = (id: number) => {
        router.post(`/appointments/${id}/check-out`, {}, {
            preserveScroll: true,
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Appointments</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage patient appointments and schedules
                        </p>
                    </div>

                    <Link href="/appointments/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            New Appointment
                        </Button>
                    </Link>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col md:flex-row gap-2">
                    <Input
                        placeholder="Search by patient or appointment number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="md:w-1/3"
                    />

                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="md:w-auto"
                    />

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="md:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                    </Select>


                    <Button onClick={handleSearch} variant="secondary">
                        <Search size={16} className="mr-2" />
                        Search
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!appointments ? (
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Appointment #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {appointments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No appointments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appointments.data.map((apt: any) => (
                                        <TableRow key={apt.id}>
                                            <TableCell className="font-mono text-sm">
                                                {apt.appointment_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {apt.patient
                                                            ?.first_name}{" "}
                                                        {apt.patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {apt.patient?.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {apt.doctor?.name ||
                                                            "N/A"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {apt.department?.name}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">
                                                        {formatDate(
                                                            apt.appointment_date
                                                        )}
                                                    </span>
                                                </div>
                                                {apt.checked_in_at && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock size={12} />
                                                        {formatTime(
                                                            apt.checked_in_at
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    #{apt.token_number}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        statusColors[
                                                        apt.status
                                                        ]
                                                    }
                                                >
                                                    {statusLabels[apt.status]}
                                                </Badge>
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* CHECK IN */}
                                                {apt.status === "scheduled" ||
                                                    apt.status === "confirmed" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            handleCheckIn(
                                                                apt.id
                                                            )
                                                        }
                                                        title="Check In"
                                                    >
                                                        <LogIn size={16} />
                                                    </Button>
                                                ) : null}

                                                {/* CHECK OUT */}
                                                {apt.status ===
                                                    "in_progress" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            handleCheckOut(
                                                                apt.id
                                                            )
                                                        }
                                                        title="Check Out"
                                                    >
                                                        <LogOut size={16} />
                                                    </Button>
                                                ) : null}

                                                {/* VIEW */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        viewAppointment(apt)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEditModal(apt)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/appointments/${apt.id}`
                                                        )
                                                    }
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* PAGINATION */}
                {appointments && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {appointments.from} to {appointments.to} of{" "}
                            {appointments.total}
                        </div>

                        <div className="flex gap-2">
                            {appointments.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    className={`px-3 py-1 rounded-md border ${link.active
                                        ? "bg-primary text-white"
                                        : "bg-background text-foreground"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                EDIT MODAL
            ============================ */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Appointment</DialogTitle>
                    </DialogHeader>

                    {editingAppointment && (
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <Label>Appointment Date</Label>
                                <Input
                                    type="date"
                                    value={
                                        editingAppointment.appointment_date?.split(
                                            "T"
                                        )[0] || ""
                                    }
                                    onChange={(e) =>
                                        setEditingAppointment({
                                            ...editingAppointment,
                                            appointment_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={editingAppointment.status}
                                    onValueChange={(value) =>
                                        setEditingAppointment({
                                            ...editingAppointment,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">
                                            Scheduled
                                        </SelectItem>
                                        <SelectItem value="confirmed">
                                            Confirmed
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                        <SelectItem value="no_show">
                                            No Show
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Reason</Label>
                                <Textarea
                                    value={editingAppointment.reason ?? ""}
                                    onChange={(e) =>
                                        setEditingAppointment({
                                            ...editingAppointment,
                                            reason: e.target.value,
                                        })
                                    }
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>Notes</Label>
                                <Textarea
                                    value={editingAppointment.notes ?? ""}
                                    onChange={(e) =>
                                        setEditingAppointment({
                                            ...editingAppointment,
                                            notes: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2
                                    className="mr-2 animate-spin"
                                    size={16}
                                />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===========================
                VIEW MODAL
            ============================ */}
            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                    </DialogHeader>

                    {viewingAppointment && (
                        <div className="space-y-6 mt-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-2xl font-bold font-mono">
                                        {viewingAppointment.appointment_number}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Token #{viewingAppointment.token_number}
                                    </div>
                                </div>
                                <Badge
                                    className={
                                        statusColors[
                                        viewingAppointment.status
                                        ]
                                    }
                                >
                                    {statusLabels[viewingAppointment.status]}
                                </Badge>
                            </div>

                            {/* Patient & Doctor Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <Label className="text-muted-foreground">
                                        Patient
                                    </Label>
                                    <p className="font-semibold text-lg">
                                        {
                                            viewingAppointment.patient
                                                ?.first_name
                                        }{" "}
                                        {viewingAppointment.patient?.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingAppointment.patient?.phone}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <Label className="text-muted-foreground">
                                        Doctor
                                    </Label>
                                    <p className="font-semibold text-lg">
                                        {viewingAppointment.doctor?.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingAppointment.department?.name}
                                    </p>
                                </div>
                            </div>

                            {/* Appointment Info */}
                            <div className="p-4 bg-muted rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span className="font-medium">
                                        {formatDate(
                                            viewingAppointment.appointment_date
                                        )}
                                    </span>
                                </div>

                                {viewingAppointment.checked_in_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <LogIn size={14} />
                                        <span>
                                            Checked in at{" "}
                                            {formatTime(
                                                viewingAppointment.checked_in_at
                                            )}
                                        </span>
                                    </div>
                                )}

                                {viewingAppointment.checked_out_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <LogOut size={14} />
                                        <span>
                                            Checked out at{" "}
                                            {formatTime(
                                                viewingAppointment.checked_out_at
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reason & Notes */}
                            {viewingAppointment.reason && (
                                <div>
                                    <Label className="text-muted-foreground">
                                        Reason for Visit
                                    </Label>
                                    <p className="mt-1">
                                        {viewingAppointment.reason}
                                    </p>
                                </div>
                            )}

                            {viewingAppointment.notes && (
                                <div>
                                    <Label className="text-muted-foreground">
                                        Notes
                                    </Label>
                                    <p className="mt-1">
                                        {viewingAppointment.notes}
                                    </p>
                                </div>
                            )}

                            {/* Related Records */}
                            {viewingAppointment.prescription && (
                                <div className="p-4 border rounded-lg">
                                    <Label>Prescription</Label>
                                    <Link
                                        href={`/prescriptions/${viewingAppointment.prescription.id}`}
                                    >
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-2"
                                        >
                                            View Prescription
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenView(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}