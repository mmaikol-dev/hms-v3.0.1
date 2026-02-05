import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
    { title: 'Visits', href: '/visits' },
    { title: 'Edit', href: '#' },
];

export default function VisitEdit() {
    const { visit } = usePage<{ visit: any }>().props;

    const form = useForm({
        symptoms: visit.symptoms ?? '',
        diagnosis: visit.diagnosis ?? '',
        treatment: visit.treatment ?? '',
        prescription: visit.prescription ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/visits/${visit.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Visit" />
            <form onSubmit={submit} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Edit Visit</CardTitle></CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="space-y-2"><Label>Symptoms</Label><Textarea value={form.data.symptoms} onChange={(e) => form.setData('symptoms', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.data.diagnosis} onChange={(e) => form.setData('diagnosis', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Treatment</Label><Input value={form.data.treatment} onChange={(e) => form.setData('treatment', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Prescription notes</Label><Textarea value={form.data.prescription} onChange={(e) => form.setData('prescription', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update Visit</LoadingButton>
                    <Link href="/visits"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
