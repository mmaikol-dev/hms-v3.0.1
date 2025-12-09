"use client";

import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useForm } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

export default function AdmissionsCreate() {
    const props: any = usePage().props;
    const { patients = [], doctors = [], beds = [] } = props;

    const form = useForm({
        patient_id: "",
        doctor_id: "",
        bed_id: "",
        admission_date: new Date().toISOString().slice(0, 16),
        admission_reason: "",
        diagnosis: "",
        treatment_plan: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/admissions", {
            preserveScroll: true,
            onSuccess: () => {
                router.get("/admissions");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Admissions", href: "/admissions" }, { title: "Create", href: "/admissions/create" }]}>
            <Head title="Create Admission" />

            <div className="p-4 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.get("/admissions")}>
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <h1 className="text-xl font-semibold">Create Admission</h1>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-sidebar-border/70">
                    <div>
                        <Label>Patient</Label>
                        <Select onValueChange={(v) => form.setData("patient_id", v)} value={form.data.patient_id}>
                            <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                            <SelectContent>
                                {patients.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.first_name} {p.last_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.patient_id && <p className="text-xs text-destructive mt-1">{form.errors.patient_id}</p>}
                    </div>

                    <div>
                        <Label>Requesting Doctor</Label>

                        <Select
                            onValueChange={(v) => form.setData("doctor_id", v)}
                            value={form.data.doctor_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>

                            <SelectContent>
                                {doctors.map((d: any) => (
                                    <SelectItem key={d.id} value={d.id.toString()}>
                                        Dr. {d.user?.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {form.errors.doctor_id && (
                            <p className="text-xs text-destructive mt-1">
                                {form.errors.doctor_id}
                            </p>
                        )}
                    </div>


                    <div>
                        <Label>Bed</Label>
                        <Select onValueChange={(v) => form.setData("bed_id", v)} value={form.data.bed_id}>
                            <SelectTrigger><SelectValue placeholder="Select bed" /></SelectTrigger>
                            <SelectContent>
                                {beds.map((b: any) => (<SelectItem key={b.id} value={b.id.toString()}>{b.bed_number} ({b.ward?.name || "—"})</SelectItem>))}
                            </SelectContent>
                        </Select>
                        {form.errors.bed_id && <p className="text-xs text-destructive mt-1">{form.errors.bed_id}</p>}
                    </div>

                    <div>
                        <Label>Admission Date</Label>
                        <Input type="datetime-local" value={form.data.admission_date} onChange={(e: any) => form.setData("admission_date", e.target.value)} />
                        {form.errors.admission_date && <p className="text-xs text-destructive mt-1">{form.errors.admission_date}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label>Reason</Label>
                        <Textarea value={form.data.admission_reason} onChange={(e: any) => form.setData("admission_reason", e.target.value)} rows={3} />
                        {form.errors.admission_reason && <p className="text-xs text-destructive mt-1">{form.errors.admission_reason}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label>Diagnosis</Label>
                        <Textarea value={form.data.diagnosis} onChange={(e: any) => form.setData("diagnosis", e.target.value)} rows={3} />
                        {form.errors.diagnosis && <p className="text-xs text-destructive mt-1">{form.errors.diagnosis}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <Label>Treatment Plan</Label>
                        <Textarea value={form.data.treatment_plan} onChange={(e: any) => form.setData("treatment_plan", e.target.value)} rows={3} />
                        {form.errors.treatment_plan && <p className="text-xs text-destructive mt-1">{form.errors.treatment_plan}</p>}
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => router.get("/admissions")}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>{form.processing ? <Loader2 className="animate-spin mr-2" size={14} /> : null} Save Admission</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
