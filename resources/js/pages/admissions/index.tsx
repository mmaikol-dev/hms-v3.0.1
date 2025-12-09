"use client";

import React, { useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash, Edit, Eye, Loader2, Calendar, User2 } from "lucide-react";
import { useForm } from "@inertiajs/react";
import { ConfirmDialog } from "@/components/confirm-dialog"; // optional - if you have one; if not, we provide inline confirmation
import { Skeleton } from "@/components/ui/skeleton";

export default function AdmissionsIndex() {
    const props: any = usePage().props;
    const { admissions, patients = [], doctors = [], beds = [], filters = {} } = props;

    const [search, setSearch] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "");

    // Modals
    const [showing, setShowing] = useState<any>(null);
    const [editing, setEditing] = useState<any>(null);
    const [discharging, setDischarging] = useState<any>(null);
    const [deleting, setDeleting] = useState<any>(null);

    // Edit form
    const editForm = useForm({
        diagnosis: "",
        treatment_plan: "",
        discharge_summary: "",
    });

    // Discharge form
    const dischargeForm = useForm({
        discharge_date: new Date().toISOString().slice(0, 16),
        discharge_summary: "",
    });

    const handleSearch = () => {
        router.get(
            "/admissions",
            { search, status: statusFilter },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openShow = (a: any) => {
        setShowing(a);
    };

    const openEdit = (a: any) => {
        setEditing(a);
        editForm.setData({
            diagnosis: a.diagnosis ?? "",
            treatment_plan: a.treatment_plan ?? "",
            discharge_summary: a.discharge_summary ?? "",
        });
    };

    const submitEdit = () => {
        if (!editing) return;
        editForm.put(`/admissions/${editing.id}`, {
            preserveState: true,
            onSuccess: (resp) => {
                setEditing(null);
            },
        });
    };

    const openDischarge = (a: any) => {
        setDischarging(a);
        dischargeForm.setData({
            discharge_date: new Date().toISOString().slice(0, 16),
            discharge_summary: "",
        });
    };

    const submitDischarge = () => {
        if (!discharging) return;
        dischargeForm.post(`/admissions/${discharging.id}/discharge`, {
            preserveState: true,
            onSuccess: () => {
                setDischarging(null);
            },
        });
    };

    const confirmDelete = (a: any) => {
        setDeleting(a);
    };

    const doDelete = () => {
        if (!deleting) return;
        router.delete(`/admissions/${deleting.id}`, {
            onFinish: () => setDeleting(null),
        });
    };

    const formatDate = (d: string | null | undefined) =>
        d ? new Date(d).toLocaleString() : "—";

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Admissions", href: "/admissions" }]}>
            <Head title="Admissions" />

            <div className="flex flex-col gap-4 p-4">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Admissions</h1>
                    <Button onClick={() => router.get("/admissions/create")} className="flex items-center gap-2">
                        <User2 size={16} /> Add Admission
                    </Button>
                </div>

                {/* Search + filters */}
                <div className="flex gap-2 w-full md:w-2/3">
                    <Input placeholder="Search patient, admission number..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
                    <select className="rounded-md border px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All status</option>
                        <option value="admitted">Admitted</option>
                        <option value="discharged">Discharged</option>
                    </select>
                    <Button onClick={handleSearch}>
                        <Calendar size={16} />
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!admissions ? (
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
                                    <TableHead>Admission #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Bed (Ward)</TableHead>
                                    <TableHead>Admitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {admissions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4">No admissions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    admissions.data.map((a: any) => (
                                        <TableRow key={a.id}>
                                            <TableCell>{a.admission_number}</TableCell>
                                            <TableCell>{a.patient?.first_name} {a.patient?.last_name}</TableCell>
                                            <TableCell>Dr. {a.doctor?.name}</TableCell>
                                            <TableCell>{a.bed?.bed_number} ({a.bed?.ward?.name ?? "—"})</TableCell>
                                            <TableCell>{formatDate(a.admission_date)}</TableCell>
                                            <TableCell>
                                                <Badge variant={a.status === "admitted" ? "default" : "secondary"}>{a.status}</Badge>
                                            </TableCell>

                                            <TableCell className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => openShow(a)}>
                                                    <Eye size={14} />
                                                </Button>

                                                {a.status === "admitted" && (
                                                    <Button size="sm" variant="secondary" onClick={() => openDischarge(a)}>
                                                        <Loader2 size={14} /> Discharge
                                                    </Button>
                                                )}

                                                <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                                                    <Edit size={14} />
                                                </Button>

                                                <Button size="sm" variant="destructive" onClick={() => confirmDelete(a)}>
                                                    <Trash size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination */}
                {admissions && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">Showing {admissions.from} to {admissions.to} of {admissions.total}</div>

                        <div className="flex gap-2">
                            {admissions.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1 rounded-md border ${link.active ? "bg-primary text-white" : "bg-background text-foreground"}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ========== Show Modal ========== */}
            <Dialog open={!!showing} onOpenChange={() => setShowing(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Admission Details</DialogTitle>
                    </DialogHeader>

                    {showing && (
                        <div className="space-y-3">
                            <div><strong>Admission #:</strong> {showing.admission_number}</div>
                            <div><strong>Patient:</strong> {showing.patient?.first_name} {showing.patient?.last_name}</div>
                            <div><strong>Doctor:</strong> Dr. {showing.doctor?.name}</div>
                            <div><strong>Bed / Ward:</strong> {showing.bed?.bed_number} / {showing.bed?.ward?.name}</div>
                            <div><strong>Admitted:</strong> {formatDate(showing.admission_date)}</div>
                            <div><strong>Reason:</strong> {showing.admission_reason}</div>
                            <div><strong>Diagnosis:</strong> {showing.diagnosis ?? "—"}</div>
                            <div><strong>Treatment:</strong> {showing.treatment_plan ?? "—"}</div>
                            <div><strong>Status:</strong> {showing.status}</div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowing(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========== Edit Modal ========== */}
            <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Admission</DialogTitle>
                    </DialogHeader>

                    {editing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Diagnosis</Label>
                                <Textarea value={editForm.data.diagnosis} onChange={(e) => editForm.setData("diagnosis", e.target.value)} />
                                {editForm.errors.diagnosis && <p className="text-xs text-destructive mt-1">{editForm.errors.diagnosis}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label>Treatment Plan</Label>
                                <Textarea value={editForm.data.treatment_plan} onChange={(e) => editForm.setData("treatment_plan", e.target.value)} />
                                {editForm.errors.treatment_plan && <p className="text-xs text-destructive mt-1">{editForm.errors.treatment_plan}</p>}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button onClick={submitEdit} disabled={editForm.processing}>
                            {editForm.processing ? <Loader2 className="mr-2 animate-spin" size={14} /> : null} Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========== Discharge Modal ========== */}
            <Dialog open={!!discharging} onOpenChange={() => setDischarging(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Discharge Patient</DialogTitle>
                    </DialogHeader>

                    {discharging && (
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label>Discharge Date</Label>
                                <Input type="datetime-local" value={dischargeForm.data.discharge_date} onChange={(e) => dischargeForm.setData("discharge_date", e.target.value)} />
                                {dischargeForm.errors.discharge_date && <p className="text-xs text-destructive mt-1">{dischargeForm.errors.discharge_date}</p>}
                            </div>

                            <div>
                                <Label>Discharge Summary</Label>
                                <Textarea value={dischargeForm.data.discharge_summary} onChange={(e) => dischargeForm.setData("discharge_summary", e.target.value)} />
                                {dischargeForm.errors.discharge_summary && <p className="text-xs text-destructive mt-1">{dischargeForm.errors.discharge_summary}</p>}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDischarging(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={submitDischarge} disabled={dischargeForm.processing}>
                            {dischargeForm.processing ? <Loader2 className="mr-2 animate-spin" size={14} /> : null} Discharge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ========== Delete Confirmation Modal ========== */}
            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Admission</DialogTitle>
                    </DialogHeader>

                    {deleting && (
                        <div>
                            <p>Are you sure you want to delete admission <strong>{deleting.admission_number}</strong> for <strong>{deleting.patient?.first_name} {deleting.patient?.last_name}</strong>?</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={doDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
