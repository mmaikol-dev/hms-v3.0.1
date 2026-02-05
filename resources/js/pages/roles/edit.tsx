import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/loading-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
    { title: 'Edit', href: '#' },
];

export default function RoleEdit() {
    const { role } = usePage<{ role: any }>().props;
    const form = useForm({ name: role.name ?? '' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />
            <form onSubmit={(e) => { e.preventDefault(); form.put(`/roles/${role.id}`); }} className="space-y-4 p-4 max-w-xl">
                <Card>
                    <CardHeader><CardTitle>Edit Role</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label>Role Name</Label>
                        <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    </CardContent>
                </Card>
                <div className="flex gap-2">
                    <LoadingButton type="submit" loading={form.processing} loadingText="Updating...">Update</LoadingButton>
                    <Link href="/roles"><Button type="button" variant="outline">Cancel</Button></Link>
                </div>
            </form>
        </AppLayout>
    );
}
