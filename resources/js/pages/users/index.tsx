// Users Index Page (UsersIndex.tsx)
// --------------------------------------------------
"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash, User2 } from "lucide-react";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Users", href: "/users" },
];

export default function UsersIndex() {
    const { users } = usePage().props as any;
    const [search, setSearch] = useState("");

    const handleSearch = () => {
        router.get(
            "/users",
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex flex-col gap-4 p-4">
                {/* TOP BAR */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Users</h1>

                    <Link href="/users/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} /> Add User
                        </Button>
                    </Link>
                </div>

                {/* SEARCH */}
                <div className="flex gap-2 w-full md:w-1/3">
                    <Input
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* USERS TABLE */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {!users ? (
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">No users found.</TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((u: any) => (
                                        <TableRow key={u.id}>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.phone ?? "—"}</TableCell>
                                            <TableCell>{u.role}</TableCell>
                                            <TableCell>
                                                <span className={u.is_active ? "text-green-600" : "text-red-500"}>
                                                    {u.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="flex gap-2 justify-end">
                                                <Link href={`/users/${u.id}`}>
                                                    <Button size="sm" variant="secondary">
                                                        <User2 size={16} />
                                                    </Button>
                                                </Link>
                                                <Link href={`/users/${u.id}/edit`}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit size={16} />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="destructive" onClick={() => router.delete(`/users/${u.id}`)}>
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
                {users && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {users.from} to {users.to} of {users.total}
                        </div>
                        <div className="flex gap-2">
                            {users.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1 rounded-md border ${link.active ? "bg-primary text-white" : "bg-background text-foreground"}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}



