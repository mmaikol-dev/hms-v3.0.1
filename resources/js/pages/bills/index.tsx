import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bills', href: '/bills' },
];

export default function BillsIndex() {
    const { bills } = usePage<{ bills: { data: any[] } }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bills" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Bills</h1>
                    <Link href="/bills/create"><Button><Plus className="mr-2 h-4 w-4" />New Bill</Button></Link>
                </div>
                <Card>
                    <CardHeader><CardTitle>Bill List</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(bills?.data ?? []).map((bill) => (
                                    <TableRow key={bill.id}>
                                        <TableCell>{bill.patient?.first_name} {bill.patient?.last_name}</TableCell>
                                        <TableCell>{bill.amount}</TableCell>
                                        <TableCell>{bill.payment_method}</TableCell>
                                        <TableCell>{bill.status}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/bills/${bill.id}/edit`}><Button size="icon" variant="outline"><Pencil className="h-4 w-4" /></Button></Link>
                                                <Button size="icon" variant="destructive" onClick={() => { if (confirm('Delete bill?')) router.delete(`/bills/${bill.id}`); }}><Trash2 className="h-4 w-4" /></Button>
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
