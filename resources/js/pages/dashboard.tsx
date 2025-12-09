import AppLayout from "@/layouts/app-layout";
import { Head, usePage } from "@inertiajs/react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function StatCard({ title, value, icon }: any) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl shadow-sm border bg-white dark:bg-neutral-900">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900">
                {icon}
            </div>
            <div>
                <p className="text-sm text-neutral-500">{title}</p>
                <h2 className="text-3xl font-bold">{value}</h2>
            </div>
        </div>
    );
}

function BedDonut({ total, occupied, available }: any) {
    const data = {
        labels: ["Occupied", "Available"],
        datasets: [
            {
                data: [occupied, available],
                backgroundColor: ["#ef4444", "#10b981"],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="rounded-2xl border p-6 bg-white dark:bg-neutral-900 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Bed Status</h3>
            <Doughnut data={data} />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <p>Total Beds: {total}</p>
                <p>Available: {available}</p>
                <p>Occupied: {occupied}</p>
            </div>
        </div>
    );
}

function AmbulanceCard({ ambulance }: any) {
    return (
        <div className="p-4 border rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
            <h4 className="font-semibold text-lg">🚑 {ambulance.vehicle_number}</h4>
            <p className="text-sm mt-1 text-neutral-500">Driver: {ambulance.driver_name}</p>
            <p className="text-sm text-neutral-500">Phone: {ambulance.driver_phone}</p>
            <p className="mt-2 text-sm font-medium">Status: {ambulance.status}</p>
        </div>
    );
}

function LatestTable({ title, data, columns }: any) {
    return (
        <div className="rounded-2xl border p-6 bg-white dark:bg-neutral-900 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        {columns.map((c: any) => (
                            <th key={c} className="py-2 text-left">{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row: any, i: number) => (
                        <tr key={i} className="border-b last:border-none">
                            {Object.values(row).map((v: any, j: number) => (
                                <td key={j} className="py-2">{v}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Dashboard() {
    const {
        stats = {},
        latestPatients = [],
        latestAppointments = [],
        bedStats = { total: 0, occupied: 0, available: 0 },
        ambulances = [],
        recentTrips = [],
        lowStock = [],
    }: any = usePage().props;

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}>
            <Head title="Dashboard" />

            <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Patients" value={stats.patients} icon={<span>🧑‍⚕️</span>} />
                    <StatCard title="Doctors" value={stats.doctors} icon={<span>👨‍⚕️</span>} />
                    <StatCard title="Today's Appointments" value={stats.appointments_today} icon={<span>📅</span>} />
                    <StatCard title="Active Admissions" value={stats.admissions} icon={<span>🏥</span>} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <BedDonut total={bedStats.total} occupied={bedStats.occupied} available={bedStats.available} />

                    <LatestTable
                        title="Latest Patients"
                        columns={["Name", "Phone"]}
                        data={latestPatients.map((p: any) => ({
                            Name: `${p.first_name} ${p.last_name}`,
                            Phone: p.phone,
                        }))}
                    />

                    <LatestTable
                        title="Latest Appointments"
                        columns={["Doctor", "Date", "Time"]}
                        data={latestAppointments.map((a: any) => ({
                            Doctor: a.doctor?.user?.name ?? "Unknown",
                            Date: a.date,
                            Time: a.time,
                        }))}
                    />
                </div>

                <h2 className="text-xl font-semibold mt-10">Ambulance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ambulances.map((a: any) => (
                        <AmbulanceCard key={a.id} ambulance={a} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                    <LatestTable
                        title="Recent Ambulance Trips"
                        columns={["Patient", "From", "To", "Date"]}
                        data={recentTrips.map((t: any) => ({
                            Patient: t.patient?.first_name + " " + t.patient?.last_name,
                            From: t.origin,
                            To: t.destination,
                            Date: t.trip_date,
                        }))}
                    />

                    <LatestTable
                        title="Low Stock Medicines"
                        columns={["Name", "Stock", "Price"]}
                        data={lowStock.map((m: any) => ({
                            Name: m.name,
                            Stock: m.stock,
                            Price: m.price,
                        }))}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
