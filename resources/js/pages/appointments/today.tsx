import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: "Today's Appointments", href: '/appointments-today' },
];

export default function AppointmentsToday() {
    const { appointments, statistics } = usePage<{ appointments: any[]; statistics: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Today's Appointments" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                    <CardContent className="grid gap-2 text-sm md:grid-cols-4">
                        <p><strong>Total:</strong> {statistics?.total ?? 0}</p>
                        <p><strong>Scheduled:</strong> {statistics?.scheduled ?? 0}</p>
                        <p><strong>In Progress:</strong> {statistics?.in_progress ?? 0}</p>
                        <p><strong>Completed:</strong> {statistics?.completed ?? 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Token</TableHead><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(appointments ?? []).map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell>{appointment.token_number ?? '-'}</TableCell>
                                        <TableCell>{appointment.patient?.first_name} {appointment.patient?.last_name}</TableCell>
                                        <TableCell>{appointment.doctor?.first_name ?? appointment.doctor?.name ?? '-'}</TableCell>
                                        <TableCell>{appointment.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
