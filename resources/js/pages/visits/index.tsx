import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Visits', href: '/visits' },
];

export default function VisitsIndex() {
    const { visits } = usePage<{ visits: { data: any[] } }>().props;

    const destroy = (id: number) => {
        if (!confirm('Delete this visit?')) return;
        router.delete(`/visits/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visits" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Visits</h1>
                    <Link href="/visits/create">
                        <Button><Plus className="mr-2 h-4 w-4" />New Visit</Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(visits?.data ?? []).map((visit) => (
                                    <TableRow key={visit.id}>
                                        <TableCell>{visit.patient?.first_name} {visit.patient?.last_name}</TableCell>
                                        <TableCell>{visit.doctor?.user?.name ?? `Doctor #${visit.doctor_id}`}</TableCell>
                                        <TableCell>{visit.diagnosis ?? '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/visits/${visit.id}`}><Button size="icon" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                                                <Link href={`/visits/${visit.id}/edit`}><Button size="icon" variant="outline"><Pencil className="h-4 w-4" /></Button></Link>
                                                <Button size="icon" variant="destructive" onClick={() => destroy(visit.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
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
