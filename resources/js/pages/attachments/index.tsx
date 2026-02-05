import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attachments', href: '/attachments' },
];

export default function AttachmentsIndex() {
    const { attachments } = usePage<{ attachments: { data: any[] } }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attachments" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Attachments</h1>
                    <Link href="/attachments/create"><Button><Plus className="mr-2 h-4 w-4" />Upload</Button></Link>
                </div>
                <Card>
                    <CardHeader><CardTitle>Uploaded Files</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>File Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {(attachments?.data ?? []).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.patient?.first_name} {item.patient?.last_name}</TableCell>
                                        <TableCell>{item.file_name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/attachments/${item.id}`}><Button size="icon" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                                                <Button size="icon" variant="destructive" onClick={() => { if (confirm('Delete attachment?')) router.delete(`/attachments/${item.id}`); }}><Trash2 className="h-4 w-4" /></Button>
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
