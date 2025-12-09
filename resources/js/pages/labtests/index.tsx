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
import { Plus, Search, Edit, Trash, Loader2, FlaskConical, Eye } from "lucide-react";
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
    { title: "Lab Tests", href: "/labtests" },
];

const categories = [
    "Hematology",
    "Biochemistry",
    "Microbiology",
    "Immunology",
    "Pathology",
    "Radiology",
    "Other"
];

export default function LabTestsIndex() {
    const { labTests } = usePage().props as any;

    const [search, setSearch] = useState("");

    // EDIT MODAL STATE
    const [openEdit, setOpenEdit] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingTest, setEditingTest] = useState<any>(null);

    // VIEW MODAL STATE
    const [openView, setOpenView] = useState(false);
    const [viewingTest, setViewingTest] = useState<any>(null);

    const handleSearch = () => {
        router.get(
            "/labtests",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openEditModal = (test: any) => {
        setEditingTest({ ...test });
        setOpenEdit(true);
    };

    const submitEdit = () => {
        if (!editingTest) return;

        setProcessing(true);

        router.put(`/labtests/${editingTest.id}`, editingTest, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpenEdit(false);
            },
        });
    };

    const viewTest = (test: any) => {
        setViewingTest(test);
        setOpenView(true);
    };

    const toggleActive = (test: any) => {
        router.put(`/labtests/${test.id}`, {
            ...test,
            is_active: !test.is_active
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Tests" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Lab Tests</h1>

                    <Link href="/labtests/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Lab Test
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search test name or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!labTests ? (
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
                                    <TableHead>Test Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {labTests.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No lab tests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    labTests.data.map((test: any) => (
                                        <TableRow key={test.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <FlaskConical className="text-primary" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {test.test_name}
                                                        </div>
                                                        {test.description && (
                                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                                {test.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                    {test.test_code}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                                    {test.category}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">
                                                    ${test.price}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {test.normal_duration_hours} hrs
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => toggleActive(test)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${test.is_active
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                        }`}
                                                >
                                                    {test.is_active ? "Active" : "Inactive"}
                                                </button>
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="flex gap-2 justify-end">
                                                {/* VIEW */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => viewTest(test)}
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                {/* EDIT */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(test)}
                                                >
                                                    <Edit size={16} />
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        router.delete(`/labtests/${test.id}`)
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
                {labTests && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {labTests.from} to {labTests.to} of{" "}
                            {labTests.total}
                        </div>

                        <div className="flex gap-2">
                            {labTests.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Lab Test</DialogTitle>
                    </DialogHeader>

                    {editingTest && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Test Name</Label>
                                <Input
                                    value={editingTest.test_name}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            test_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Test Code</Label>
                                <Input
                                    value={editingTest.test_code}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            test_code: e.target.value,
                                        })
                                    }
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={editingTest.category}
                                    onValueChange={(value) =>
                                        setEditingTest({
                                            ...editingTest,
                                            category: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editingTest.price}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            price: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Normal Duration (hours)</Label>
                                <Input
                                    type="number"
                                    value={editingTest.normal_duration_hours ?? ""}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            normal_duration_hours: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editingTest.is_active}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active Status
                                </Label>
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingTest.description ?? ""}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Preparation Instructions</Label>
                                <Textarea
                                    value={editingTest.preparation_instructions ?? ""}
                                    onChange={(e) =>
                                        setEditingTest({
                                            ...editingTest,
                                            preparation_instructions: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    placeholder="E.g., Patient should fast for 12 hours before the test..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing && (
                                <Loader2
                                    className="mr-2 animate-spin"
                                    size={16}
                                />
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Lab Test Details</DialogTitle>
                    </DialogHeader>

                    {viewingTest && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Test Name
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingTest.test_name}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Test Code
                                    </h3>
                                    <p className="font-mono font-semibold">
                                        {viewingTest.test_code}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Category
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingTest.category}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Price
                                    </h3>
                                    <p className="font-semibold text-lg">
                                        ${viewingTest.price}
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Duration
                                    </h3>
                                    <p className="font-semibold">
                                        {viewingTest.normal_duration_hours} hours
                                    </p>
                                </div>

                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                        Status
                                    </h3>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${viewingTest.is_active
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                                            }`}
                                    >
                                        {viewingTest.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {viewingTest.description && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingTest.description}
                                    </p>
                                </div>
                            )}

                            {viewingTest.preparation_instructions && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold mb-2">
                                        Preparation Instructions
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {viewingTest.preparation_instructions}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
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