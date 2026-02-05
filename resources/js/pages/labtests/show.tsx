import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Lab Tests', href: '/labtests' },
    { title: 'Details', href: '#' },
];

export default function LabTestShow() {
    const { labTest } = usePage<{ labTest: any }>().props;
    const form = useForm({
        test_name: labTest.test_name ?? '',
        category: labTest.category ?? '',
        price: String(labTest.price ?? ''),
        normal_duration_hours: String(labTest.normal_duration_hours ?? ''),
        description: labTest.description ?? '',
        preparation_instructions: labTest.preparation_instructions ?? '',
        is_active: Boolean(labTest.is_active),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Test Details" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/labtests/${labTest.id}`); }} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{labTest.test_name}</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>Test Name</Label><Input value={form.data.test_name} onChange={(e) => form.setData('test_name', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Category</Label><Input value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Price</Label><Input type="number" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Duration (hours)</Label><Input type="number" value={form.data.normal_duration_hours} onChange={(e) => form.setData('normal_duration_hours', e.target.value)} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Description</Label><Input value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update</LoadingButton>
                    <Button type="button" variant="destructive" onClick={() => { if (confirm('Delete lab test?')) router.delete(`/labtests/${labTest.id}`); }}>Delete</Button>
                    <Link href="/labtests"><Button type="button" variant="outline">Back</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
