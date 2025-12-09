import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BriefcaseMedical, User as UserIcon, FileText } from "lucide-react";

export default function DoctorShow() {
    const { doctor } = usePage().props;

    const safe = doctor || {};
    const user = safe.user || {};
    const dept = safe.department || {};

    const appointments = safe.appointments || [];
    const prescriptions = safe.prescriptions || [];
    const admissions = safe.admissions || [];

    return (
        <AppLayout>
            <Head title={`Doctor - ${user.name || "Profile"}`} />

            <div className="p-6 space-y-6">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BriefcaseMedical className="w-6 h-6 text-primary" />
                            Dr. {user.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">Specialization: {safe.specialization}</p>
                    </div>

                    <button
                        onClick={() =>
                            window.location.href = `/doctors/${doctor.id}/report`
                        }
                        className="px-4 py-2 bg-primary text-white rounded-md shadow flex items-center gap-2"
                    >

                        Download Report
                    </button>


                </div>

                {/* OVERVIEW CARD */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Profile Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Name</Label>
                            <p className="font-medium">Dr. {user.name}</p>
                        </div>
                        <div>
                            <Label>Department</Label>
                            <p className="font-medium">{dept.name || "-"}</p>
                        </div>
                        <div>
                            <Label>Qualification</Label>
                            <p className="font-medium">{safe.qualification}</p>
                        </div>

                        <div>
                            <Label>Experience (years)</Label>
                            <p className="font-medium">{safe.experience_years}</p>
                        </div>
                        <div>
                            <Label>Consultation Fee</Label>
                            <p className="font-medium">KES {safe.consultation_fee}</p>
                        </div>
                        <div>
                            <Label>Available Days</Label>
                            <p className="font-medium flex gap-2 flex-wrap">
                                {(safe.available_days || []).map((d, i) => (
                                    <Badge key={i} variant="secondary">{d}</Badge>
                                ))}
                            </p>
                        </div>

                        <div>
                            <Label>Shift Start</Label>
                            <p className="font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> {safe.shift_start}</p>
                        </div>
                        <div>
                            <Label>Shift End</Label>
                            <p className="font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> {safe.shift_end}</p>
                        </div>
                        <div className="md:col-span-3">
                            <Label>Biography</Label>
                            <p className="font-medium leading-relaxed mt-1 text-muted-foreground">{safe.biography}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* TABS */}
                <Tabs defaultValue="appointments" className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full md:w-1/2 lg:w-1/3">
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                        <TabsTrigger value="admissions">Admissions</TabsTrigger>
                    </TabsList>

                    {/* APPOINTMENTS TAB */}
                    <TabsContent value="appointments">
                        <Card className="shadow-sm">
                            <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.length ? appointments.map(a => (
                                            <TableRow key={a.id}>
                                                <TableCell className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {a.date}</TableCell>
                                                <TableCell>{a.patient?.name || '-'}</TableCell>
                                                <TableCell><Badge>{a.status}</Badge></TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No appointments found</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PRESCRIPTIONS TAB */}
                    <TabsContent value="prescriptions">
                        <Card className="shadow-sm">
                            <CardHeader><CardTitle>Prescriptions</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {prescriptions.length ? prescriptions.map(p => (
                                    <Card key={p.id} className="border p-4">
                                        <h4 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Prescription #{p.id}</h4>
                                        <p className="text-sm text-muted-foreground">{p.notes}</p>
                                        <p className="font-medium mt-2">Patient: {p.patient?.name || '-'}</p>
                                    </Card>
                                )) : <p className="text-center text-muted-foreground">No prescriptions found</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ADMISSIONS TAB */}
                    <TabsContent value="admissions">
                        <Card className="shadow-sm">
                            <CardHeader><CardTitle>Admissions</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Ward</TableHead>
                                            <TableHead>Bed</TableHead>
                                            <TableHead>Admitted On</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {admissions.length ? admissions.map(ad => (
                                            <TableRow key={ad.id}>
                                                <TableCell>{ad.patient?.name || '-'}</TableCell>
                                                <TableCell>{ad.bed?.ward?.name || '-'}</TableCell>
                                                <TableCell>{ad.bed?.number || '-'}</TableCell>
                                                <TableCell>{ad.admitted_at}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No admissions found</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
