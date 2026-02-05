import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    { title: 'Wards', href: '/wards' },
    { title: 'Details', href: '#' },
];

export default function WardShow() {
    const { ward } = usePage<{ ward: any }>().props;
    const form = useForm({
        name: ward.name ?? '',
        type: ward.type ?? 'general',
        floor_number: String(ward.floor_number ?? 1),
        total_beds: String(ward.total_beds ?? 1),
        is_active: Boolean(ward.is_active),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ward" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/wards/${ward.id}`); }} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{ward.name}</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>Name</Label><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Type</Label><Select value={form.data.type} onValueChange={(v) => form.setData('type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['general','private','icu','emergency','maternity','pediatric'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Floor</Label><Input type="number" value={form.data.floor_number} onChange={(e) => form.setData('floor_number', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Total beds</Label><Input type="number" value={form.data.total_beds} onChange={(e) => form.setData('total_beds', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Saving...">Update Ward</LoadingButton>
                    <Button type="button" variant="destructive" onClick={() => { if (confirm('Delete ward?')) router.delete(`/wards/${ward.id}`); }}>Delete</Button>
                    <Link href="/wards"><Button type="button" variant="outline">Back</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
