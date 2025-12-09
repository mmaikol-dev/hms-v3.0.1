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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash, Calendar, Loader2, User2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Doctors", href: "/doctors" },
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

export default function DoctorsIndex() {
    const { doctors, departments, users } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<any>(null);

    // SCHEDULE MODAL STATE
    const [openSchedule, setOpenSchedule] = useState(false);
    const [scheduleDoctor, setScheduleDoctor] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/doctors",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (doctor: any) => {
        setEditingDoctor({
            ...doctor,
            available_days: doctor.available_days || [],
        });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingDoctor) return;

        setProcessing(true);

        router.put(`/doctors/${editingDoctor.id}`, editingDoctor, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewSchedule = (doctor: any) => {
        // Fetch schedule details
        fetch(`/doctors/${doctor.id}/schedule`)
            .then((res) => res.json())
            .then((data) => {
                setScheduleDoctor(data);
                setOpenSchedule(true);
            })
            .catch((err) => console.error(err));
    };

    const toggleDay = (day: string) => {
        if (!editingDoctor) return;

        const days = editingDoctor.available_days || [];
        const newDays = days.includes(day)
            ? days.filter((d: string) => d !== day)
            : [...days, day];

        setEditingDoctor({
            ...editingDoctor,
            available_days: newDays,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctors" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Doctors</h1>

                    <Link href="/doctors/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Doctor
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search doctor name or specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!doctors ? (
                        // LOADING STATE
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
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Fee</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {doctors.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-4"
                                        >
                                            No doctors found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    doctors.data.map((d: any) => (
                                        <TableRow key={d.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-primary text-sm font-semibold">
                                                            {d.user?.name?.charAt(0) || "D"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {d.user?.name || "N/A"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {d.qualification}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {d.department?.name || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {d.specialization}
                                            </TableCell>
                                            <TableCell>
                                                {d.experience_years || 0} years
                                            </TableCell>
                                            <TableCell>
                                                ${d.consultation_fee}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* SCHEDULE */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                    onClick={() => viewSchedule(d)}
                                                >
                                                    <Calendar size={16} />
                                                </Button>

                                                {/* PROFILE */}
                                                <Link href={`/doctors/${d.id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="flex items-center gap-1"
                                                    >
                                                        <User2 size={16} />
                                                    </Button>
                                                </Link>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEditModal(d)
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
                                                            `/doctors/${d.id}`
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
                {doctors && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {doctors.from} to {doctors.to} of{" "}
                            {doctors.total}
                        </div>

                        <div className="flex gap-2">
                            {doctors.links.map((link: any, i: number) => (
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                    </DialogHeader>

                    {editingDoctor && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Department</Label>
                                <Select
                                    value={editingDoctor.department_id?.toString()}
                                    onValueChange={(value) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            department_id: parseInt(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
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
                            </div>

                            <div>
                                <Label>Specialization</Label>
                                <Input
                                    value={editingDoctor.specialization}
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            specialization: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Qualification</Label>
                                <Input
                                    value={editingDoctor.qualification}
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            qualification: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Consultation Fee</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingDoctor.consultation_fee}
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            consultation_fee: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Experience (years)</Label>
                                <Input
                                    type="number"
                                    value={
                                        editingDoctor.experience_years ?? ""
                                    }
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            experience_years: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Shift Start</Label>
                                <Input
                                    type="time"
                                    value={editingDoctor.shift_start ?? ""}
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            shift_start: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Shift End</Label>
                                <Input
                                    type="time"
                                    value={editingDoctor.shift_end ?? ""}
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            shift_end: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Biography</Label>
                                <Textarea
                                    value={editingDoctor.biography ?? ""}
                                    onChange={(e) =>
                                        setEditingDoctor({
                                            ...editingDoctor,
                                            biography: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label className="mb-2 block">
                                    Available Days
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {daysOfWeek.map((day) => (
                                        <Button
                                            key={day}
                                            type="button"
                                            size="sm"
                                            variant={
                                                editingDoctor.available_days?.includes(
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
                SCHEDULE MODAL
            ============================ */}
            <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Doctor Schedule - {scheduleDoctor?.user?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {scheduleDoctor && (
                        <div className="space-y-4 mt-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Working Hours
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {scheduleDoctor.shift_start || "N/A"} -{" "}
                                    {scheduleDoctor.shift_end || "N/A"}
                                </p>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Available Days
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {scheduleDoctor.available_days?.length >
                                        0 ? (
                                        scheduleDoctor.available_days.map(
                                            (day: string) => (
                                                <span
                                                    key={day}
                                                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                                >
                                                    {day}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            No days specified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Upcoming Appointments
                                </h3>
                                {scheduleDoctor.appointments?.length > 0 ? (
                                    <div className="space-y-2">
                                        {scheduleDoctor.appointments
                                            .slice(0, 5)
                                            .map((apt: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-background rounded-lg text-sm"
                                                >
                                                    <div className="font-medium">
                                                        {apt.appointment_date}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {apt.status}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No upcoming appointments
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenSchedule(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}