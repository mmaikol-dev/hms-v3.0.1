"use client";

import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Loader2, ArrowLeft, Pill } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Prescriptions", href: "/prescriptions" },
    { title: "Create", href: "/prescriptions/create" },
];

interface MedicineItem {
    medicine_id: string;
    dosage: string;
    frequency: string;
    duration_days: string;
    quantity: string;
    instructions: string;
}

export default function PrescriptionsCreate() {
    const { patients, doctors, medicines, appointments, errors } = usePage().props as any;

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        appointment_id: "",
        prescription_date: new Date().toISOString().split("T")[0],
        diagnosis: "",
        notes: "",
    });

    const [items, setItems] = useState<MedicineItem[]>([
        {
            medicine_id: "",
            dosage: "",
            frequency: "",
            duration_days: "",
            quantity: "",
            instructions: "",
        },
    ]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                medicine_id: "",
                dosage: "",
                frequency: "",
                duration_days: "",
                quantity: "",
                instructions: "",
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (
        index: number,
        field: keyof MedicineItem,
        value: string
    ) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate items
        const hasEmptyFields = items.some(
            (item) =>
                !item.medicine_id ||
                !item.dosage ||
                !item.frequency ||
                !item.duration_days ||
                !item.quantity
        );

        if (hasEmptyFields) {
            alert("Please fill in all required medicine fields");
            return;
        }

        setProcessing(true);

        router.post(
            "/prescriptions",
            {
                ...formData,
                items: items,
            },
            {
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    const getMedicineStock = (medicineId: string) => {
        const medicine = medicines?.find((m: any) => m.id === parseInt(medicineId));
        return medicine?.quantity_in_stock || 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Prescription" />

            <div className="p-4 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get("/prescriptions")}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Create New Prescription
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Fill in the details to create a new prescription
                        </p>
                    </div>
                </div>

                {errors && Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                            {Object.values(errors).map((error: any, idx) => (
                                <div key={idx}>{error}</div>
                            ))}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>
                                        Patient <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.patient_id}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                patient_id: value,
                                            })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients?.map((patient: any) => (
                                                <SelectItem
                                                    key={patient.id}
                                                    value={patient.id.toString()}
                                                >
                                                    {patient.first_name} {patient.last_name} - {patient.phone}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>
                                        Doctor <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.doctor_id}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                doctor_id: value,
                                            })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors?.map((doctor: any) => (
                                                <SelectItem
                                                    key={doctor.id}
                                                    value={doctor.id.toString()}
                                                >
                                                    {doctor.user?.name} - {doctor.specialization}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Appointment (Optional)</Label>
                                    <Select
                                        value={formData.appointment_id}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                appointment_id: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Appointment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {appointments?.map((apt: any) => (
                                                <SelectItem
                                                    key={apt.id}
                                                    value={apt.id.toString()}
                                                >
                                                    {apt.patient?.name} - {apt.appointment_date}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>
                                        Prescription Date{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.prescription_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                prescription_date: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Diagnosis</Label>
                                <Textarea
                                    value={formData.diagnosis}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            diagnosis: e.target.value,
                                        })
                                    }
                                    placeholder="Enter diagnosis details..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Additional Notes</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Any additional notes or instructions..."
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medicines */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="w-5 h-5" />
                                Medicines
                            </CardTitle>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAddItem}
                                variant="outline"
                            >
                                <Plus size={16} className="mr-1" />
                                Add Medicine
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg space-y-3 relative"
                                >
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2"
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="md:col-span-2">
                                            <Label>
                                                Medicine{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={item.medicine_id}
                                                onValueChange={(value) =>
                                                    handleItemChange(
                                                        index,
                                                        "medicine_id",
                                                        value
                                                    )
                                                }
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Medicine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {medicines?.map((medicine: any) => (
                                                        <SelectItem
                                                            key={medicine.id}
                                                            value={medicine.id.toString()}
                                                        >
                                                            {medicine.name} (Stock:{" "}
                                                            {medicine.quantity_in_stock})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {item.medicine_id && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Available stock:{" "}
                                                    {getMedicineStock(item.medicine_id)}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>
                                                Dosage{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={item.dosage}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "dosage",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., 500mg"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label>
                                                Frequency{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={item.frequency}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "frequency",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Twice daily"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label>
                                                Duration (Days){" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.duration_days}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "duration_days",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="7"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label>
                                                Quantity{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantity",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="14"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>Instructions (Optional)</Label>
                                            <Textarea
                                                value={item.instructions}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "instructions",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Take after meals"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get("/prescriptions")}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            )}
                            Create Prescription
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}