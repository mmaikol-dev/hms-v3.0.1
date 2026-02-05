import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Prescriptions', href: '/prescriptions' },
    { title: 'Edit', href: '#' },
];

export default function PrescriptionEdit() {
    const { prescription } = usePage<{ prescription: any }>().props;
    const form = useForm({
        diagnosis: prescription.diagnosis ?? '',
        notes: prescription.notes ?? '',
        status: prescription.status ?? 'pending',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Prescription" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/prescriptions/${prescription.id}`); }} className="space-y-4 p-4 max-w-2xl">
                <Card>
                    <CardHeader><CardTitle>Edit {prescription.prescription_number}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.data.diagnosis} onChange={(e) => form.setData('diagnosis', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Notes</Label><Textarea value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Status</Label><Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['pending','dispensed','cancelled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update</LoadingButton>
                    <Link href="/prescriptions"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
