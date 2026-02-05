import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Visits', href: '/visits' },
    { title: 'Details', href: '#' },
];

export default function VisitShow() {
    const { visit } = usePage<{ visit: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Visit Details" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Visit #{visit.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Patient:</strong> {visit.patient?.first_name} {visit.patient?.last_name}</p>
                        <p><strong>Doctor:</strong> {visit.doctor?.user?.name ?? `Doctor #${visit.doctor_id}`}</p>
                        <p><strong>Symptoms:</strong> {visit.symptoms ?? '-'}</p>
                        <p><strong>Diagnosis:</strong> {visit.diagnosis ?? '-'}</p>
                        <p><strong>Treatment:</strong> {visit.treatment ?? '-'}</p>
                        <p><strong>Prescription:</strong> {visit.prescription ?? '-'}</p>
                    </CardContent>
                </Card>
                <Link href={`/visits/${visit.id}/edit`}><Button>Edit Visit</Button></Link>
            </div>
        </AppLayout>
    );
}
