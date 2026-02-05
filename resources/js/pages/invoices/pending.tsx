import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pending Invoices', href: '#' },
];

export default function InvoicesPending() {
    const { invoices } = usePage<{ invoices: any[] }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Invoices" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Pending Invoices</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {(invoices ?? []).map((invoice) => (
                            <div key={invoice.id} className="rounded border p-3 text-sm">
                                <p><strong>{invoice.invoice_number}</strong> - {invoice.patient?.first_name} {invoice.patient?.last_name}</p>
                                <Link className="text-blue-600" href={`/invoices/${invoice.id}`}>View</Link>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
