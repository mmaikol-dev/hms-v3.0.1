import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attachments', href: '/attachments' },
    { title: 'Details', href: '#' },
];

export default function AttachmentShow() {
    const { attachment } = usePage<{ attachment: any }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attachment Details" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Attachment #{attachment.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Patient:</strong> {attachment.patient?.first_name} {attachment.patient?.last_name}</p>
                        <p><strong>File Name:</strong> {attachment.file_name}</p>
                        <p><strong>File Path:</strong> {attachment.file_path}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
