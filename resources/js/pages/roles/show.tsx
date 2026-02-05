import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
    { title: 'Details', href: '#' },
];

export default function RoleShow() {
    const { role } = usePage<{ role: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Details" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Role</CardTitle></CardHeader>
                    <CardContent>
                        <p><strong>Name:</strong> {role.name}</p>
                    </CardContent>
                </Card>
                <Link href={`/roles/${role.id}/edit`}><Button>Edit</Button></Link>
            </div>
        </AppLayout>
    );
}
