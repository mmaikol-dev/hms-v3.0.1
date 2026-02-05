import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Patient Invoices', href: '#' },
];

export default function InvoicesByPatient() {
    const { invoices, patient } = usePage<{ invoices: any[]; patient: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Invoices" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Invoices for {patient?.first_name} {patient?.last_name}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(invoices ?? []).map((invoice) => (
                            <div key={invoice.id} className="rounded border p-3 text-sm">
                                <p><strong>{invoice.invoice_number}</strong> - {invoice.total_amount}</p>
                                <Link className="text-blue-600" href={`/invoices/${invoice.id}`}>View</Link>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
