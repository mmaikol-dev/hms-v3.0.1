import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daily Payments Report', href: '#' },
];

export default function PaymentsDailyReport() {
    const { date, summary } = usePage<{ date: string; summary: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Payment Report" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Daily Report - {date}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Total payments:</strong> {summary?.total_payments ?? 0}</p>
                        <p><strong>Total amount:</strong> {summary?.total_amount ?? 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Payment List</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>No.</TableHead><TableHead>Patient</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(summary?.payments ?? []).map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.payment_number}</TableCell>
                                        <TableCell>{p.invoice?.patient?.first_name} {p.invoice?.patient?.last_name}</TableCell>
                                        <TableCell>{p.payment_method}</TableCell>
                                        <TableCell>{p.amount}</TableCell>
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
