import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payments', href: '/payments' },
    { title: 'Details', href: '#' },
];

export default function PaymentShow() {
    const { payment } = usePage<{ payment: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{payment.payment_number}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Patient:</strong> {payment.patient?.first_name} {payment.patient?.last_name}</p>
                        <p><strong>Invoice:</strong> {payment.invoice?.invoice_number}</p>
                        <p><strong>Amount:</strong> {payment.amount}</p>
                        <p><strong>Method:</strong> {payment.payment_method}</p>
                        <p><strong>Date:</strong> {payment.payment_date}</p>
                        <p><strong>Received By:</strong> {payment.received_by?.name ?? payment.receivedBy?.name ?? '-'}</p>
                        <p><strong>Notes:</strong> {payment.notes ?? '-'}</p>
                    </CardContent>
                </Card>
                <Link href="/payments"><Button>Back</Button></Link>
            </div>
        </AppLayout>
    );
}
