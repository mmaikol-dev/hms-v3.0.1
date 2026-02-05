import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Prescriptions', href: '/prescriptions' },
    { title: 'Details', href: '#' },
];

export default function PrescriptionShow() {
    const { prescription } = usePage<{ prescription: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prescription" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{prescription.prescription_number}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Patient:</strong> {prescription.patient?.first_name} {prescription.patient?.last_name}</p>
                        <p><strong>Doctor:</strong> {prescription.doctor?.user?.name ?? '-'}</p>
                        <p><strong>Date:</strong> {prescription.prescription_date}</p>
                        <p><strong>Status:</strong> {prescription.status}</p>
                        <p><strong>Diagnosis:</strong> {prescription.diagnosis ?? '-'}</p>
                        <p><strong>Notes:</strong> {prescription.notes ?? '-'}</p>
                    </CardContent>
                </Card>
                <Link href={`/prescriptions/${prescription.id}/edit`}><Button>Edit Prescription</Button></Link>
            </div>
        </AppLayout>
    );
}
