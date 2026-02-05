import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
];

export default function RolesIndex() {
    const { roles } = usePage<{ roles: { data: any[] } }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    <Link href="/roles/create"><Button><Plus className="mr-2 h-4 w-4" />New Role</Button></Link>
                </div>
                <Card>
                    <CardHeader><CardTitle>Role List</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(roles?.data ?? []).map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>{role.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/roles/${role.id}/edit`}><Button size="icon" variant="outline"><Pencil className="h-4 w-4" /></Button></Link>
                                                <Button size="icon" variant="destructive" onClick={() => { if (confirm('Delete role?')) router.delete(`/roles/${role.id}`); }}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
