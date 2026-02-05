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
    { title: 'Create', href: '/attachments/create' },
];

export default function AttachmentCreate() {
    const { patients } = usePage<{ patients: any[] }>().props;
    const form = useForm({ patient_id: '', file: null as File | null });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Attachment" />
            <form onSubmit={(e) => { e.preventDefault(); form.post('/attachments'); }} className="space-y-4 p-4 max-w-2xl">
                <Card>
                    <CardHeader><CardTitle>Upload File</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Patient</Label>
                            <Select value={form.data.patient_id} onValueChange={(v) => form.setData('patient_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                                <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>File</Label>
                            <Input type="file" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} />
                        </div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Uploading...">Upload</LoadingButton>
                    <Link href="/attachments"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
