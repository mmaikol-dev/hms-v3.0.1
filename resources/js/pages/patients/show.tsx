"use client";

import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Upload, File, DollarSign, Clock, User, Phone, MapPin, Calendar, Stethoscope, Bed, Pill, Beaker, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PatientShow() {
    const { props }: any = usePage();
    const patient: any = props.patient ?? null;

    const fmtDate = (d: string | null | undefined) =>
        d ? new Date(d).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : "—";

    const fmtCurrency = (v: number | null | undefined) =>
        typeof v === "number"
            ? new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: "KES",
                maximumFractionDigits: 0,
            }).format(v)
            : "—";

    // Derived arrays with safe fallbacks
    const visits = (patient?.appointments ?? []).map((a: any) => ({
        id: a.id,
        date: a.created_at ?? a.date ?? null,
        doctor: a.doctor?.name ?? "N/A",
        notes: a.notes ?? "-",
        status: a.status ?? "completed"
    }));

    const admissions = (patient?.admissions ?? []).map((ad: any) => ({
        id: ad.id,
        date: ad.created_at ?? ad.date ?? null,
        bedNumber: ad.bed?.number ?? "N/A",
        wardName: ad.bed?.ward?.name ?? "N/A",
        notes: ad.notes ?? "-",
        status: ad.status ?? "discharged"
    }));

    const prescriptions = (patient?.prescriptions ?? []).map((p: any) => ({
        id: p.id,
        notes: p.notes ?? "-",
        date: p.created_at ?? null,
        doctor: p.doctor?.name ?? "N/A",
        items: (p.items ?? []).map((it: any, idx: number) => ({
            id: it.id ?? idx,
            quantity: it.quantity ?? it.qty ?? "-",
            dosage: it.dosage ?? "-",
            medicineName: it.medicine?.name ?? it.medicine_name ?? "N/A",
        })),
    }));

    const labRequests = (patient?.lab_test_requests ?? []).map((r: any) => ({
        id: r.id,
        status: r.status ?? "unknown",
        date: r.created_at ?? null,
        labTestName: r.lab_test?.test_name ?? "N/A",
        notes: r.notes ?? "-",
    }));

    const medicalRecords = (patient?.medicalRecords ?? []).map((m: any) => ({
        id: m.id,
        title: m.title ?? m.name ?? "Record",
        description: m.description ?? "-",
        date: m.created_at ?? null,
        fileUrl: m.file_url ?? m.path ?? null,
        type: m.type ?? "document"
    }));

    const invoices = (patient?.invoices ?? []).map((inv: any) => ({
        id: inv.id,
        invoice_no: inv.invoice_no ?? `INV-${inv.id}`,
        total: inv.total ?? inv.amount ?? 0,
        status: inv.status ?? "unknown",
        date: inv.created_at ?? null,
        payments: (inv.payments ?? []).map((pay: any) => ({
            id: pay.id,
            amount: pay.amount,
            method: pay.method ?? pay.payment_method ?? "N/A",
            date: pay.created_at ?? null,
        })),
    }));

    return (
        <AppLayout>
            <Head title={`${patient ? `${patient.first_name} ${patient.last_name}` : "Patient Profile"}`} />

            <div className="container mx-auto p-4 md:p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {patient ? `${patient.first_name} ${patient.last_name}` : <Skeleton className="h-8 w-56" />}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{patient ? `Patient ID: ${patient.patient_id ?? patient.id}` : <Skeleton className="h-4 w-40" />}</span>
                            {patient?.file_no && (
                                <>
                                    <Separator orientation="vertical" className="h-4" />
                                    <span>File No: {patient.file_no}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/patients/${patient?.id}/edit`}>
                                Edit Patient
                            </a>
                        </Button>
                        <Button
                            onClick={() => window.location.href = `/patients/${patient?.id}/report`}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Generate Report
                        </Button>
                    </div>
                </div>

                {/* Patient Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Personal Info</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lg font-semibold capitalize">
                                            {patient?.gender ?? "—"}
                                        </span>
                                        <Separator orientation="vertical" className="h-4" />
                                        <span className="text-lg font-semibold">
                                            {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Phone className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {patient?.phone ?? "—"}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {patient?.email ?? "No email"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                                    <p className="text-lg font-semibold mt-1 line-clamp-1">
                                        {patient?.city ?? "—"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {patient?.state ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-amber-100 p-3 rounded-full">
                                    <Calendar className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {patient?.appointments?.[0]?.created_at ?
                                            new Date(patient.appointments[0].created_at).toLocaleDateString()
                                            : "No visits yet"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {visits.length} total visits
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="visits" className="space-y-6">
                    <div className="border-b">
                        <TabsList className="h-auto p-0 bg-transparent border-0">
                            <TabsTrigger value="visits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                                <Stethoscope className="h-4 w-4 mr-2" />
                                Visits
                            </TabsTrigger>
                            <TabsTrigger value="admissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                                <Bed className="h-4 w-4 mr-2" />
                                Admissions
                            </TabsTrigger>
                            <TabsTrigger value="prescriptions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                                <Pill className="h-4 w-4 mr-2" />
                                Prescriptions
                            </TabsTrigger>
                            <TabsTrigger value="labs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
                                <Beaker className="h-4 w-4 mr-2" />
                                Lab Tests
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Visits Tab */}
                    <TabsContent value="visits" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visit History</CardTitle>
                                <CardDescription>
                                    {visits.length} visits recorded
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Doctor</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {visits.length > 0 ? (
                                                visits.map((v) => (
                                                    <TableRow key={v.id}>
                                                        <TableCell className="font-medium">
                                                            {fmtDate(v.date)}
                                                        </TableCell>
                                                        <TableCell>{v.doctor}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={v.status === 'completed' ? 'default' : 'secondary'}>
                                                                {v.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">{v.notes}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No visit history found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Admissions Tab */}
                    <TabsContent value="admissions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Admission History</CardTitle>
                                <CardDescription>
                                    {admissions.length} admissions recorded
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Bed</TableHead>
                                                <TableHead>Ward</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {admissions.length > 0 ? (
                                                admissions.map((a) => (
                                                    <TableRow key={a.id}>
                                                        <TableCell className="font-medium">
                                                            {fmtDate(a.date)}
                                                        </TableCell>
                                                        <TableCell>{a.bedNumber}</TableCell>
                                                        <TableCell>{a.wardName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={a.status === 'discharged' ? 'secondary' : 'default'}>
                                                                {a.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">{a.notes}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No admissions found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Prescriptions Tab */}
                    <TabsContent value="prescriptions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Prescriptions</CardTitle>
                                <CardDescription>
                                    {prescriptions.length} prescriptions issued
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {prescriptions.length > 0 ? (
                                    <div className="space-y-6">
                                        {prescriptions.map((pres) => (
                                            <Card key={pres.id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h4 className="font-semibold">Prescription #{pres.id}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Prescribed by {pres.doctor} • {fmtDate(pres.date)}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">{pres.items.length} items</Badge>
                                                    </div>

                                                    {pres.notes && (
                                                        <div className="mb-4 p-3 bg-muted rounded-md">
                                                            <p className="text-sm">{pres.notes}</p>
                                                        </div>
                                                    )}

                                                    <div className="rounded-md border">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Medicine</TableHead>
                                                                    <TableHead>Quantity</TableHead>
                                                                    <TableHead>Dosage</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {pres.items.map((it) => (
                                                                    <TableRow key={it.id}>
                                                                        <TableCell className="font-medium">{it.medicineName}</TableCell>
                                                                        <TableCell>{it.quantity}</TableCell>
                                                                        <TableCell>{it.dosage}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No prescriptions found.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Lab Tests Tab */}
                    <TabsContent value="labs" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lab Test Requests</CardTitle>
                                <CardDescription>
                                    {labRequests.length} lab tests requested
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Test</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {labRequests.length > 0 ? (
                                                labRequests.map((r) => (
                                                    <TableRow key={r.id}>
                                                        <TableCell className="font-medium">
                                                            {fmtDate(r.date)}
                                                        </TableCell>
                                                        <TableCell>{r.labTestName}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    r.status === 'completed' ? 'default' :
                                                                        r.status === 'pending' ? 'secondary' :
                                                                            r.status === 'processing' ? 'outline' : 'destructive'
                                                                }
                                                            >
                                                                {r.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">{r.notes}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No lab test requests found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Additional Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Medical Records */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Medical Records</CardTitle>
                                <CardDescription>
                                    Patient medical documents and records
                                </CardDescription>
                            </div>
                            <Button size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Record
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {medicalRecords.length > 0 ? (
                                <div className="space-y-4">
                                    {medicalRecords.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-blue-100 p-2 rounded-md">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{m.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {fmtDate(m.date)} • {m.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {m.fileUrl && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            View
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <File className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No medical records found.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Summary</CardTitle>
                            <CardDescription>
                                Payment and invoice status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Invoices</span>
                                            <span className="font-semibold">{invoices.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Amount</span>
                                            <span className="font-semibold">
                                                {fmtCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Paid Amount</span>
                                            <span className="font-semibold text-green-600">
                                                {fmtCurrency(
                                                    invoices.reduce((sum, inv) =>
                                                        sum + inv.payments.reduce((paySum, pay) => paySum + pay.amount, 0), 0
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h4 className="font-medium">Recent Invoices</h4>
                                        {invoices.slice(0, 3).map((inv) => (
                                            <div key={inv.id} className="p-3 border rounded-md">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{inv.invoice_no}</span>
                                                    <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                                                        {inv.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">{fmtDate(inv.date)}</span>
                                                    <span className="font-semibold">{fmtCurrency(inv.total)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {invoices.length > 3 && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <a href={`/patients/${patient?.id}/billing`}>
                                                View All Invoices
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No billing information found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}