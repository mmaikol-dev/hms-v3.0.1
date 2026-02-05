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
    { title: 'Users', href: '/users' },
    { title: 'Edit', href: '#' },
];

export default function UserEdit() {
    const { user, departments } = usePage<{ user: any; departments: any[] }>().props;

    const form = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        role: user.role ?? 'receptionist',
        department_id: user.department_id ? String(user.department_id) : '',
        license_number: user.license_number ?? '',
        address: user.address ?? '',
        date_of_birth: user.date_of_birth ?? '',
        gender: user.gender ?? '',
        is_active: Boolean(user.is_active),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/users/${user.id}`); }} className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Edit User</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>Name</Label><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Role</Label><Select value={form.data.role} onValueChange={(v) => form.setData('role', v)}><SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger><SelectContent>{['admin','doctor','nurse','receptionist','pharmacist','lab_technician','accountant'].map((r) => <SelectItem key={r} value={r}>{r.replace('_',' ')}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Department</Label><Select value={form.data.department_id || 'none'} onValueChange={(v) => form.setData('department_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{departments?.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>License Number</Label><Input value={form.data.license_number} onChange={(e) => form.setData('license_number', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.data.date_of_birth ?? ''} onChange={(e) => form.setData('date_of_birth', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Gender</Label><Select value={form.data.gender || 'none'} onValueChange={(v) => form.setData('gender', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Status</Label><Select value={form.data.is_active ? 'active' : 'inactive'} onValueChange={(v) => form.setData('is_active', v === 'active')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} /></div>
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update User</LoadingButton>
                    <Link href="/users"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
