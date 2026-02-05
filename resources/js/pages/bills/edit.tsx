import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bills', href: '/bills' },
    { title: 'Edit', href: '#' },
];

export default function BillEdit() {
    const { bill } = usePage<{ bill: any }>().props;
    const form = useForm({ amount: String(bill.amount ?? ''), payment_method: bill.payment_method ?? 'Cash', status: bill.status ?? 'Pending' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Bill" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/bills/${bill.id}`); }} className="space-y-4 p-4 max-w-2xl">
                <Card>
                    <CardHeader><CardTitle>Edit Bill</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Method</Label><Select value={form.data.payment_method} onValueChange={(v) => form.setData('payment_method', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Cash','Insurance','Mpesa','Card'].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Status</Label><Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Pending','Paid'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update Bill</LoadingButton>
                    <Link href="/bills"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
