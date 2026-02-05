import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/invoices' },
    { title: 'Details', href: '#' },
];

export default function InvoiceShow() {
    const { invoice } = usePage<{ invoice: any }>().props;
    const form = useForm({
        file_no: invoice.file_no ?? '',
        member_no: invoice.member_no ?? '',
        invoice_date: invoice.invoice_date ? String(invoice.invoice_date).slice(0, 16) : '',
        due_date: invoice.due_date ? String(invoice.due_date).slice(0, 10) : '',
        tax_amount: String(invoice.tax_amount ?? 0),
        discount_amount: String(invoice.discount_amount ?? 0),
        notes: invoice.notes ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/invoices/${invoice.id}`); }} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{invoice.invoice_number}</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <p className="text-sm md:col-span-2"><strong>Patient:</strong> {invoice.patient?.first_name} {invoice.patient?.last_name}</p>
                        <div className="space-y-2"><Label>File No</Label><Input value={form.data.file_no} onChange={(e) => form.setData('file_no', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Member No</Label><Input value={form.data.member_no} onChange={(e) => form.setData('member_no', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Invoice Date</Label><Input type="datetime-local" value={form.data.invoice_date} onChange={(e) => form.setData('invoice_date', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Tax</Label><Input type="number" value={form.data.tax_amount} onChange={(e) => form.setData('tax_amount', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Discount</Label><Input type="number" value={form.data.discount_amount} onChange={(e) => form.setData('discount_amount', e.target.value)} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update Invoice</LoadingButton>
                    <Button type="button" variant="destructive" onClick={() => { if (confirm('Delete invoice?')) router.delete(`/invoices/${invoice.id}`); }}>Delete</Button>
                    <Link href="/invoices"><Button type="button" variant="outline">Back</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
