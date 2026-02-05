import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bills', href: '/bills' },
    { title: 'Details', href: '#' },
];

export default function BillShow() {
    const { bill } = usePage<{ bill: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bill Details" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Bill #{bill.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Patient:</strong> {bill.patient?.first_name} {bill.patient?.last_name}</p>
                        <p><strong>Amount:</strong> {bill.amount}</p>
                        <p><strong>Payment method:</strong> {bill.payment_method}</p>
                        <p><strong>Status:</strong> {bill.status}</p>
                    </CardContent>
                </Card>
                <Link href={`/bills/${bill.id}/edit`}><Button>Edit Bill</Button></Link>
            </div>
        </AppLayout>
    );
}
