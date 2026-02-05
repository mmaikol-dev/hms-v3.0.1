import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Visits', href: '/visits' },
    { title: 'Create', href: '/visits/create' },
];

export default function VisitCreate() {
    const { patients, doctors, appointments } = usePage<{ patients: any[]; doctors: any[]; appointments: any[] }>().props;

    const form = useForm({
        patient_id: '',
        doctor_id: '',
        appointment_id: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/visits');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Visit" />
            <form onSubmit={submit} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>New Visit</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Patient</Label>
                            <Select value={form.data.patient_id} onValueChange={(v) => form.setData('patient_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                                <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Doctor</Label>
                            <Select value={form.data.doctor_id} onValueChange={(v) => form.setData('doctor_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                                <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.user?.name ?? `Doctor #${d.id}`}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Appointment (optional)</Label>
                            <Select value={form.data.appointment_id} onValueChange={(v) => form.setData('appointment_id', v === 'none' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {appointments.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.appointment_date}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2"><Label>Symptoms</Label><Textarea value={form.data.symptoms} onChange={(e) => form.setData('symptoms', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.data.diagnosis} onChange={(e) => form.setData('diagnosis', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Treatment</Label><Input value={form.data.treatment} onChange={(e) => form.setData('treatment', e.target.value)} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Prescription notes</Label><Textarea value={form.data.prescription} onChange={(e) => form.setData('prescription', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Saving...">Save Visit</LoadingButton>
                    <Link href="/visits"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
