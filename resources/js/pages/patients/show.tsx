"use client";

import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
import { Upload, File, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientShow() {
    const { props }: any = usePage();
    const patient: any = props.patient ?? null;

    const fmtDate = (d: string | null | undefined) =>
        d ? new Date(d).toLocaleString() : "—";

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
    }));

    const admissions = (patient?.admissions ?? []).map((ad: any) => ({
        id: ad.id,
        date: ad.created_at ?? ad.date ?? null,
        bedNumber: ad.bed?.number ?? "N/A",
        wardName: ad.bed?.ward?.name ?? "N/A",
        notes: ad.notes ?? "-",
    }));

    const prescriptions = (patient?.prescriptions ?? []).map((p: any) => ({
        id: p.id,
        notes: p.notes ?? "-",
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

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-start justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {patient ? `${patient.first_name} ${patient.last_name}` : <Skeleton className="h-6 w-56" />}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {patient ? `Patient ID: ${patient.patient_id ?? "—"}` : <Skeleton className="h-4 w-40 mt-2" />}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`/patients/${patient?.id}/edit`}>Edit</a>
                        </Button>
                        <button
                            onClick={() => {
                                window.location.href = `/patients/${patient.id}/report`;
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded"
                        >
                            Generate Report
                        </button>

                    </div>
                </div>

                {/* Patient Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {patient ? (
                            <>
                                <div>
                                    <Label>Name</Label>
                                    <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                </div>
                                <div>
                                    <Label>DOB</Label>
                                    <p className="font-medium">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <Label>Gender</Label>
                                    <p className="font-medium capitalize">{patient.gender ?? "—"}</p>
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <p className="font-medium">{patient.phone ?? "—"}</p>
                                </div>
                                <div>
                                    <Label>Address</Label>
                                    <p className="font-medium">{patient.address ?? "—"}</p>
                                </div>
                                <div>
                                    <Label>Last Visit</Label>
                                    <p className="font-medium">{patient.appointments?.[0]?.created_at ? fmtDate(patient.appointments[0].created_at) : "No visits yet"}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="visits" className="w-full">
                    <TabsList className="grid grid-cols-4 w-full mb-4">
                        <TabsTrigger value="visits">Visit History</TabsTrigger>
                        <TabsTrigger value="admissions">Admissions</TabsTrigger>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                        <TabsTrigger value="labs">Lab Tests</TabsTrigger>
                    </TabsList>

                    {/* Visits */}
                    <TabsContent value="visits">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Visit History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visits.length > 0 ? (
                                            visits.map((v) => (
                                                <TableRow key={v.id}>
                                                    <TableCell>{fmtDate(v.date)}</TableCell>
                                                    <TableCell>{v.doctor}</TableCell>
                                                    <TableCell>{v.notes}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : patient ? (
                                            <TableRow>
                                                <TableCell colSpan={3}>No visit history.</TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3}><Skeleton className="h-6 w-full" /></TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Admissions */}
                    <TabsContent value="admissions">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Admissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Bed</TableHead>
                                            <TableHead>Ward</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {admissions.length > 0 ? (
                                            admissions.map((a) => (
                                                <TableRow key={a.id}>
                                                    <TableCell>{fmtDate(a.date)}</TableCell>
                                                    <TableCell>{a.bedNumber}</TableCell>
                                                    <TableCell>{a.wardName}</TableCell>
                                                    <TableCell>{a.notes}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : patient ? (
                                            <TableRow>
                                                <TableCell colSpan={4}>No admissions.</TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Prescriptions */}
                    <TabsContent value="prescriptions">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Prescriptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {prescriptions.length > 0 ? (
                                    prescriptions.map((pres) => (
                                        <div key={pres.id} className="mb-4 border rounded-md p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <div className="font-semibold">Prescription #{pres.id}</div>
                                                    <div className="text-sm text-muted-foreground">{pres.notes}</div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">Items: {pres.items.length}</div>
                                            </div>

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
                                                            <TableCell>{it.medicineName}</TableCell>
                                                            <TableCell>{it.quantity}</TableCell>
                                                            <TableCell>{it.dosage}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))
                                ) : patient ? (
                                    <div className="p-4">No prescriptions.</div>
                                ) : (
                                    <Skeleton className="h-6 w-full" />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Lab Tests */}
                    <TabsContent value="labs">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Lab Test Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                                    <TableCell>{fmtDate(r.date)}</TableCell>
                                                    <TableCell>{r.labTestName}</TableCell>
                                                    <TableCell className="capitalize">{r.status}</TableCell>
                                                    <TableCell>{r.notes}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : patient ? (
                                            <TableRow>
                                                <TableCell colSpan={4}>No lab requests.</TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Lower row: Medical Records + Billing + Attachments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Medical Records */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {medicalRecords.length > 0 ? (
                                <ul className="space-y-3">
                                    {medicalRecords.map((m) => (
                                        <li key={m.id} className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="font-semibold">{m.title}</div>
                                                <div className="text-sm text-muted-foreground">{m.description}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{fmtDate(m.date)}</div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {m.fileUrl ? (
                                                    <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-sm underline">Open</a>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No file</span>
                                                )}
                                                <Button variant="ghost" size="sm"><File className="w-4 h-4" /></Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : patient ? (
                                <div>No medical records.</div>
                            ) : (
                                <Skeleton className="h-12 w-full" />
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoices.length > 0 ? (
                                <div className="space-y-4">
                                    {invoices.map((inv) => (
                                        <div key={inv.id} className="border rounded-md p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">{inv.invoice_no}</div>
                                                    <div className="text-sm text-muted-foreground">{fmtDate(inv.date)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">{fmtCurrency(inv.total)}</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{inv.status}</div>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="text-sm font-medium mb-2">Payments</div>
                                                {inv.payments.length > 0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Amount</TableHead>
                                                                <TableHead>Method</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {inv.payments.map((p) => (
                                                                <TableRow key={p.id}>
                                                                    <TableCell>{fmtDate(p.date)}</TableCell>
                                                                    <TableCell>{fmtCurrency(p.amount)}</TableCell>
                                                                    <TableCell>{p.method}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">No payments recorded.</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : patient ? (
                                <div>No invoices.</div>
                            ) : (
                                <Skeleton className="h-12 w-full" />
                            )}
                        </CardContent>
                    </Card>

                    {/* Attachments / Upload */}
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Attachments</CardTitle>
                            <Button size="sm">
                                <Upload className="w-4 h-4 mr-2" /> Upload
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {medicalRecords.length > 0 ? (
                                <div className="space-y-3">
                                    {medicalRecords.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <File className="w-4 h-4" />
                                                <div>
                                                    <div className="text-sm font-medium">{m.title}</div>
                                                    <div className="text-xs text-muted-foreground">{fmtDate(m.date)}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <Button variant="ghost" size="sm">Download</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : patient ? (
                                <div>No attachments.</div>
                            ) : (
                                <Skeleton className="h-12 w-full" />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
