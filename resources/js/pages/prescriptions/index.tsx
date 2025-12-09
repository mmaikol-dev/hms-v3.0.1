"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    Eye,
    Trash,
    FileText,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Pill
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Prescriptions", href: "/prescriptions" },
];

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    dispensed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusIcons = {
    pending: AlertCircle,
    dispensed: CheckCircle2,
    cancelled: XCircle,
};

export default function PrescriptionsIndex() {
    const { prescriptions, filters } = usePage().props as any;

    const [search, setSearch] = useState(filters?.search || "");
    const [viewPrescription, setViewPrescription] = useState<any>(null);
    const [openView, setOpenView] = useState(false);
    const [dispensing, setDispensing] = useState<number | null>(null);

    const handleSearch = () => {
        router.get(
            "/prescriptions",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDispense = (prescriptionId: number) => {
        if (!confirm("Are you sure you want to dispense this prescription?")) {
            return;
        }

        setDispensing(prescriptionId);

        router.post(
            `/prescriptions/${prescriptionId}/dispense`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setDispensing(null);
                },
            }
        );
    };

    const handleDelete = (prescriptionId: number) => {
        if (!confirm("Are you sure you want to delete this prescription?")) {
            return;
        }

        router.delete(`/prescriptions/${prescriptionId}`);
    };

    const viewDetails = (prescription: any) => {
        setViewPrescription(prescription);
        setOpenView(true);
    };

    const StatusIcon = ({ status }: { status: string }) => {
        const Icon = statusIcons[status as keyof typeof statusIcons];
        return Icon ? <Icon className="w-4 h-4" /> : null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prescriptions" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Prescriptions</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage patient prescriptions and medication orders
                        </p>
                    </div>

                    <Link href="/prescriptions/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            New Prescription
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search by prescription number, patient, or diagnosis..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!prescriptions ? (
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Prescription #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {prescriptions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-8"
                                        >
                                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">
                                                No prescriptions found.
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    prescriptions.data.map((prescription: any) => {
                                        const StatusIconComponent = statusIcons[
                                            prescription.status as keyof typeof statusIcons
                                        ];

                                        return (
                                            <TableRow key={prescription.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-primary" />
                                                        <span className="font-mono text-sm">
                                                            {prescription.prescription_number}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {prescription.patient?.first_name + " " + prescription.patient?.last_name || "N/A"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {prescription.patient?.phone}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {prescription.doctor?.user?.name || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        prescription.prescription_date
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px] truncate">
                                                        {prescription.diagnosis || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Pill className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {prescription.items?.length || 0} medicines
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`flex items-center gap-1 w-fit ${statusColors[
                                                            prescription.status as keyof typeof statusColors
                                                        ]
                                                            }`}
                                                    >
                                                        {StatusIconComponent && (
                                                            <StatusIconComponent className="w-3 h-3" />
                                                        )}
                                                        {prescription.status}
                                                    </Badge>
                                                </TableCell>

                                                {/* ACTIONS */}
                                                <TableCell className="flex gap-2 justify-end">
                                                    {/* VIEW */}
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            viewDetails(prescription)
                                                        }
                                                    >
                                                        <Eye size={16} />
                                                    </Button>

                                                    {/* DISPENSE */}
                                                    {prescription.status === "pending" && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() =>
                                                                handleDispense(prescription.id)
                                                            }
                                                            disabled={
                                                                dispensing === prescription.id
                                                            }
                                                        >
                                                            {dispensing === prescription.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>Dispense</>
                                                            )}
                                                        </Button>
                                                    )}

                                                    {/* DELETE */}
                                                    {prescription.status !== "dispensed" && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDelete(prescription.id)
                                                            }
                                                        >
                                                            <Trash size={16} />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* PAGINATION */}
                {prescriptions && prescriptions.data.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {prescriptions.from} to {prescriptions.to} of{" "}
                            {prescriptions.total}
                        </div>

                        <div className="flex gap-2">
                            {prescriptions.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded-md border ${link.active
                                        ? "bg-primary text-white"
                                        : "bg-background text-foreground hover:bg-muted"
                                        } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                VIEW DETAILS MODAL
            ============================ */}
            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                            {viewPrescription?.prescription_number}
                        </DialogDescription>
                    </DialogHeader>

                    {viewPrescription && (
                        <div className="space-y-6 mt-4">
                            {/* Patient & Doctor Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Patient Information
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">
                                                Name:{" "}
                                            </span>
                                            {viewPrescription.patient?.name}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">
                                                Phone:{" "}
                                            </span>
                                            {viewPrescription.patient?.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">
                                        Doctor Information
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">
                                                Name:{" "}
                                            </span>
                                            {viewPrescription.doctor?.user?.name}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">
                                                Date:{" "}
                                            </span>
                                            {new Date(
                                                viewPrescription.prescription_date
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            {viewPrescription.diagnosis && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Diagnosis</h3>
                                    <p className="text-sm">
                                        {viewPrescription.diagnosis}
                                    </p>
                                </div>
                            )}

                            {/* Medicines */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Pill className="w-4 h-4" />
                                    Prescribed Medicines
                                </h3>
                                <div className="space-y-3">
                                    {viewPrescription.items?.map(
                                        (item: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="p-4 border rounded-lg"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {item.medicine?.name}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.dosage} - {item.frequency}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">
                                                        Qty: {item.quantity}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            Duration:{" "}
                                                        </span>
                                                        {item.duration_days} days
                                                    </p>
                                                    {item.instructions && (
                                                        <p>
                                                            <span className="text-muted-foreground">
                                                                Instructions:{" "}
                                                            </span>
                                                            {item.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {viewPrescription.notes && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Notes</h3>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {viewPrescription.notes}
                                    </p>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <span className="font-semibold">Status</span>
                                <Badge
                                    className={
                                        statusColors[
                                        viewPrescription.status as keyof typeof statusColors
                                        ]
                                    }
                                >
                                    {viewPrescription.status}
                                </Badge>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        {viewPrescription?.status === "pending" && (
                            <Button
                                onClick={() => {
                                    handleDispense(viewPrescription.id);
                                    setOpenView(false);
                                }}
                                disabled={dispensing === viewPrescription?.id}
                            >
                                {dispensing === viewPrescription?.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Dispensing...
                                    </>
                                ) : (
                                    "Dispense Prescription"
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setOpenView(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}