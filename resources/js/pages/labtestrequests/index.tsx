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
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash, Loader2, FileText, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Lab Test Requests", href: "/labtest-requests" },
];

const statusOptions = [
    "pending",
    "sample_collected",
    "in_progress",
    "completed",
    "cancelled"
];

const statusColors = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    sample_collected: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    in_progress: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

export default function LabTestRequestsIndex() {
    const { requests, technicians } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingRequest, setEditingRequest] = useState<any>(null);

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingRequest, setViewingRequest] = useState<any>(null);

    // ASSIGN TECHNICIAN MODAL
    const [openAssign, setOpenAssign] = useState(false);
    const [assigningRequest, setAssigningRequest] = useState<any>(null);
    const [selectedTechnician, setSelectedTechnician] = useState("");

    // SUBMIT RESULT MODAL
    const [openResult, setOpenResult] = useState(false);
    const [resultRequest, setResultRequest] = useState<any>(null);
    const [resultText, setResultText] = useState("");

    const handleSearch = () => {
        router.get(
            "/labtest-requests",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (request: any) => {
        setEditingRequest({ ...request });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingRequest) return;

        setProcessing(true);

        router.put(`/labtest-requests/${editingRequest.id}`, editingRequest, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewRequest = (request: any) => {
        setViewingRequest(request);
        setOpenView(true);
    };

    const openAssignModal = (request: any) => {
        setAssigningRequest(request);
        setSelectedTechnician(request.assigned_to?.toString() || "");
        setOpenAssign(true);
    };

    const submitAssignment = () => {
        if (!assigningRequest || !selectedTechnician) return;

        setProcessing(true);

        router.post(
            `/labtest-requests/${assigningRequest.id}/assign-technician`,
            { assigned_to: selectedTechnician },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setOpenAssign(false);
                },
            }
        );
    };

    const openResultModal = (request: any) => {
        setResultRequest(request);
        setResultText(request.result || "");
        setOpenResult(true);
    };

    const submitResult = () => {
        if (!resultRequest || !resultText.trim()) return;

        setProcessing(true);

        router.post(
            `/labtest-requests/${resultRequest.id}/submit-result`,
            { result: resultText },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setOpenResult(false);
                },
            }
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Test Requests" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Lab Test Requests</h1>

                    <Link href="/labtestrequests/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            New Request
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search by request number or patient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!requests ? (
                        // LOADING STATE
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
                                    <TableHead>Request #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Test</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested Date</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {requests.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-4"
                                        >
                                            No lab test requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.data.map((request: any) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium">
                                                    {request.request_number}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {request.patient
                                                            ? `${request.patient.first_name} ${request.patient.last_name}`
                                                            : "N/A"
                                                        }

                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ID: {request.patient?.patient_id || "N/A"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {request.lab_test?.test_name || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {request.lab_test?.test_code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {request.doctor?.name || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {request.assigned_technician?.name ? (
                                                    <span className="text-sm">
                                                        {request.assigned_technician.name}
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openAssignModal(request)}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[
                                                        request.status as keyof typeof statusColors
                                                    ]
                                                        }`}
                                                >
                                                    {request.status.replace("_", " ")}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(request.requested_date)}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* VIEW */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewRequest(request)}
                                                >
                                                    <FileText size={16} />
                                                </Button>

                                                {/* SUBMIT RESULT */}
                                                {request.status !== "completed" &&
                                                    request.status !== "cancelled" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                openResultModal(request)
                                                            }
                                                        >
                                                            <UserCheck size={16} />
                                                        </Button>
                                                    )}

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(request)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/labtest-requests/${request.id}`
                                                        )
                                                    }
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* PAGINATION */}
                {requests && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {requests.from} to {requests.to} of{" "}
                            {requests.total}
                        </div>

                        <div className="flex gap-2">
                            {requests.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1 rounded-md border ${link.active
                                        ? "bg-primary text-white"
                                        : "bg-background text-foreground"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                EDIT MODAL
            ============================ */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Lab Test Request</DialogTitle>
                    </DialogHeader>

                    {editingRequest && (
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={editingRequest.status}
                                    onValueChange={(value) =>
                                        setEditingRequest({
                                            ...editingRequest,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.replace("_", " ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Notes</Label>
                                <Textarea
                                    value={editingRequest.notes ?? ""}
                                    onChange={(e) =>
                                        setEditingRequest({
                                            ...editingRequest,
                                            notes: e.target.value,
                                        })
                                    }
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 animate-spin" size={16} />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===========================
                VIEW MODAL
            ============================ */}
            <Dialog open={openView} onOpenChange={setOpenView}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex justify-between items-center">
                        <DialogTitle>Lab Test Request Details</DialogTitle>
                    </DialogHeader>

                    {viewingRequest && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Request Number
                                    </h3>
                                    <p className="font-mono font-semibold">
                                        {viewingRequest.request_number}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Status
                                    </h3>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[
                                            viewingRequest.status as keyof typeof statusColors
                                        ]
                                            }`}
                                    >
                                        {viewingRequest.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="p-4 bg-muted rounded-lg col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Patient
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingRequest.patient.first_name + " " + viewingRequest.patient.last_name || "N/A"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ID: {viewingRequest.patient?.patient_id}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Lab Test
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingRequest.lab_test?.test_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingRequest.lab_test?.test_code}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Doctor
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingRequest.doctor?.name || "N/A"}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Assigned Technician
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingRequest.assigned_technician?.name ||
                                            "Not assigned yet"}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Requested Date
                                    </h3>
                                    <p className="font-semibold">
                                        {formatDate(viewingRequest.requested_date)}
                                    </p>
                                </div>

                                {viewingRequest.sample_collected_at && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Sample Collected
                                        </h3>
                                        <p className="font-semibold">
                                            {formatDate(viewingRequest.sample_collected_at)}
                                        </p>
                                    </div>
                                )}

                                {viewingRequest.result_date && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                            Result Date
                                        </h3>
                                        <p className="font-semibold">
                                            {formatDate(viewingRequest.result_date)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {viewingRequest.result && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Test Result</h3>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {viewingRequest.result}
                                    </p>
                                </div>
                            )}

                            {viewingRequest.notes && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Notes</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingRequest.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FOOTER BUTTONS */}
                    <div className="flex justify-end mt-6">
                        {viewingRequest && viewingRequest.id && (
                            <Button
                                className="mt-2"
                                onClick={() => {
                                    window.location.href = `/labtest-requests/${viewingRequest.id}/generate-report`;
                                }}
                            >
                                Generate Report
                            </Button>
                        )}

                        <Button variant="outline" onClick={() => setOpenView(false)}>
                            Close
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>


            {/* ===========================
                ASSIGN TECHNICIAN MODAL
            ============================ */}
            <Dialog open={openAssign} onOpenChange={setOpenAssign}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Technician</DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        <Label>Select Technician</Label>
                        <Select
                            value={selectedTechnician}
                            onValueChange={setSelectedTechnician}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a technician" />
                            </SelectTrigger>
                            <SelectContent>
                                {technicians?.map((tech: any) => (
                                    <SelectItem key={tech.id} value={tech.id.toString()}>
                                        {tech.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenAssign(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAssignment}
                            disabled={processing || !selectedTechnician}
                        >
                            {processing && (
                                <Loader2 className="mr-2 animate-spin" size={16} />
                            )}
                            Assign
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===========================
                SUBMIT RESULT MODAL
            ============================ */}
            <Dialog open={openResult} onOpenChange={setOpenResult}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Test Result</DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        <Label>Test Result</Label>
                        <Textarea
                            value={resultText}
                            onChange={(e) => setResultText(e.target.value)}
                            rows={6}
                            placeholder="Enter the test results here..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setOpenResult(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitResult}
                            disabled={processing || !resultText.trim()}
                        >
                            {processing && (
                                <Loader2 className="mr-2 animate-spin" size={16} />
                            )}
                            Submit Result
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}