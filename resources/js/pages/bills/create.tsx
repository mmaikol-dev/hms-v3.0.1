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
    { title: 'Create', href: '/bills/create' },
];

export default function BillCreate() {
    const { patients } = usePage<{ patients: any[] }>().props;
    const form = useForm({ patient_id: '', amount: '', payment_method: '', status: 'Pending' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bill" />
            <form onSubmit={(e) => { e.preventDefault(); form.post('/bills'); }} className="space-y-4 p-4 max-w-2xl">
                <Card>
                    <CardHeader><CardTitle>Create Bill</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Patient</Label>
                            <Select value={form.data.patient_id} onValueChange={(v) => form.setData('patient_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                                <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Method</Label><Select value={form.data.payment_method} onValueChange={(v) => form.setData('payment_method', v)}><SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger><SelectContent>{['Cash','Insurance','Mpesa','Card'].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Saving...">Save Bill</LoadingButton>
                    <Link href="/bills"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
