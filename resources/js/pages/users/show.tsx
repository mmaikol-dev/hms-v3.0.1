import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
    { title: 'Details', href: '#' },
];

export default function UserShow() {
    const { user } = usePage<{ user: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{user.name}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role ?? '-'}</p>
                        <p><strong>Department:</strong> {user.department?.name ?? '-'}</p>
                        <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
                    </CardContent>
                </Card>
                <Link href={`/users/${user.id}/edit`}><Button>Edit User</Button></Link>
            </div>
        </AppLayout>
    );
}
