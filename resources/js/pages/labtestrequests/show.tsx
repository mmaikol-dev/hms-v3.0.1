import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Lab Requests', href: '/labtestrequests' },
    { title: 'Details', href: '#' },
];

export default function LabTestRequestShow() {
    const { labRequest } = usePage<{ labRequest: any }>().props;
    const form = useForm({
        assigned_to: labRequest.assigned_to ? String(labRequest.assigned_to) : '',
        status: labRequest.status ?? 'pending',
        result: labRequest.result ?? '',
        notes: labRequest.notes ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Request" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/labtestrequests/${labRequest.id}`); }} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{labRequest.request_number}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm"><strong>Patient:</strong> {labRequest.patient?.first_name} {labRequest.patient?.last_name}</p>
                        <p className="text-sm"><strong>Doctor:</strong> {labRequest.doctor?.name ?? '-'}</p>
                        <p className="text-sm"><strong>Test:</strong> {labRequest.lab_test?.test_name ?? labRequest.labTest?.test_name}</p>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{['pending','sample_collected','in_progress','completed','cancelled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Result</Label><Textarea value={form.data.result} onChange={(e) => form.setData('result', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Notes</Label><Textarea value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Saving...">Update Request</LoadingButton>
                    <Link href="/labtestrequests"><Button type="button" variant="outline">Back</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
