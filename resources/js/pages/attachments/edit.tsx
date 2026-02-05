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
    { title: 'Attachments', href: '/attachments' },
    { title: 'Edit', href: '#' },
];

export default function AttachmentEdit() {
    const { attachment, patients } = usePage<{ attachment: any; patients: any[] }>().props;
    const form = useForm({
        _method: 'put',
        patient_id: String(attachment.patient_id),
        file: null as File | null,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Attachment" />
            <form onSubmit={(e) => { e.preventDefault(); form.post(`/attachments/${attachment.id}`); }} className="space-y-4 p-4 max-w-2xl">
                <Card>
                    <CardHeader><CardTitle>Edit Attachment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm"><strong>Current file:</strong> {attachment.file_name}</p>
                        <div className="space-y-2">
                            <Label>Patient</Label>
                            <Select value={form.data.patient_id} onValueChange={(v) => form.setData('patient_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Replace file (optional)</Label>
                            <Input type="file" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} />
                        </div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update Attachment</LoadingButton>
                    <Link href={`/attachments/${attachment.id}`}><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
