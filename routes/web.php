<?php

use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceItemController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\LabTestRequestController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WardController;
use App\Models\Appointment;
use App\Models\Bed;
use App\Models\Invoice;
use App\Models\Ward;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'patients' => \App\Models\Patient::count(),
                'doctors' => \App\Models\Doctor::count(),
                'appointments_today' => \App\Models\Appointment::whereDate('appointment_date', today())->count(),
                'admissions' => \App\Models\Admission::whereNull('discharge_date')->count(),
            ],
            'latestPatients' => \App\Models\Patient::latest()->take(5)->get(),
            'latestAppointments' => \App\Models\Appointment::with('doctor')->latest()->take(5)->get(),
            'bedStats' => [
                'total' => \App\Models\Bed::count(),
                'occupied' => \App\Models\Bed::where('status', 'occupied')->count(),
                'available' => \App\Models\Bed::where('status', 'available')->count(),
            ],
        ]);
    });

    // admissions (web)
    Route::get('/admissions', [AdmissionController::class, 'index'])->name('admissions.index');
    Route::get('/admissions/create', [AdmissionController::class, 'create'])->name('admissions.create');

    // IMPORTANT: Put this AFTER create/edit
    Route::get('/admissions/{admission}/edit', [AdmissionController::class, 'edit'])->name('admissions.edit');
    Route::get('/admissions/{admission}', [AdmissionController::class, 'show'])->name('admissions.show');

    // API actions
    Route::post('/admissions', [AdmissionController::class, 'store'])->name('admissions.store');
    Route::put('/admissions/{admission}', [AdmissionController::class, 'update'])->name('admissions.update');
    Route::post('/admissions/{admission}/discharge', [AdmissionController::class, 'discharge'])->name('admissions.discharge');
    Route::delete('/admissions/{admission}', [AdmissionController::class, 'destroy'])->name('admissions.destroy');

    // users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/create', [UserController::class, 'create']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/users/{id}/edit', [UserController::class, 'edit']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // PATIENTS
    // PDF Report Route
    Route::get('/patients/{patient}/report', [PatientController::class, 'generateReport'])
        ->name('patients.report');

    Route::middleware(['auth', 'can:view-patients'])
        ->resource('patients', PatientController::class);

    // DOCTORS
    Route::get('/doctors/{doctor}/report', [DoctorController::class, 'generateReport'])
        ->name('doctors.report');
    Route::resource('doctors', DoctorController::class);

    // DEPARTMENTS
    Route::resource('departments', DepartmentController::class);

    // inventory
    Route::resource('inventoryitems', InventoryItemController::class);

    Route::get('inventoryitems-low-stock', [InventoryItemController::class, 'getLowStock']);
    Route::post('inventoryitems/{id}/adjust-stock', [InventoryItemController::class, 'adjustStock']);
    Route::get('inventoryitems/category/{category}', [InventoryItemController::class, 'getByCategory']);
    Route::get('inventoryitems-search', [InventoryItemController::class, 'search']);
    Route::get('/inventoryitems/create', [InventoryItemController::class, 'create'])->name('inventoryitems.create');

    // APPOINTMENTS
    Route::resource('appointments', AppointmentController::class);

    // Additional appointment routes
    Route::post('appointments/{id}/check-in', [AppointmentController::class, 'checkIn'])
        ->name('appointments.check-in');

    Route::post('appointments/{id}/check-out', [AppointmentController::class, 'checkOut'])
        ->name('appointments.check-out');

    Route::get('appointments/date/{date}', [AppointmentController::class, 'getByDate'])
        ->name('appointments.by-date');

    Route::get('appointments-today', [AppointmentController::class, 'today'])
        ->name('appointments.today');

    // VISITS
    Route::resource('visits', VisitController::class);

    // PRESCRIPTIONS
    Route::get('/prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
    Route::get('/prescriptions/create', [PrescriptionController::class, 'create'])->name('prescriptions.create');
    Route::post('/prescriptions', [PrescriptionController::class, 'store'])->name('prescriptions.store');
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show'])->name('prescriptions.show');
    Route::get('/prescriptions/{id}/edit', [PrescriptionController::class, 'edit'])->name('prescriptions.edit');
    Route::put('/prescriptions/{id}', [PrescriptionController::class, 'update'])->name('prescriptions.update');
    Route::delete('/prescriptions/{id}', [PrescriptionController::class, 'destroy'])->name('prescriptions.destroy');

    // Additional action - Dispense prescription
    Route::post('/prescriptions/{id}/dispense', [PrescriptionController::class, 'dispense'])->name('prescriptions.dispense');

    // MEDICINES
    Route::resource('medicines', MedicineController::class);

    // LAB TESTS
    Route::resource('labtests', LabTestController::class);

    // Lab Test Requests Management
    Route::get('/labtest-requests/{id}/generate-report', [LabTestRequestController::class, 'generateReport']);

    Route::resource('labtestrequests', LabTestRequestController::class);

    // Additional Lab Test Request Routes
    Route::post('labtestrequests/{id}/assign-technician', [
        LabTestRequestController::class,
        'assignTechnician',
    ])->name('labtest-requests.assign-technician');

    Route::post('labtestrequests/{id}/submit-result', [
        LabTestRequestController::class,
        'submitResult',
    ])->name('labtestrequests.submit-result');

    // ADMISSIONS

    // ATTACHMENTS
    Route::resource('attachments', AttachmentController::class);

    // BILLS
    Route::resource('bills', BillController::class);

    // invoice
    Route::resource('invoices', InvoiceController::class);
    Route::resource('invoiceitems', InvoiceItemController::class);

    // bed
    Route::resource('beds', BedController::class);

    // ward
    Route::resource('wards', WardController::class);

    // ROLES
    Route::resource('roles', RoleController::class);

    // payments

    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/create', [PaymentController::class, 'create'])->name('payments.create');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    Route::get('/payments/{id}', [PaymentController::class, 'show'])->name('payments.show');
    Route::put('/payments/{id}', [PaymentController::class, 'update'])->name('payments.update');
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy'])->name('payments.destroy');

    // Additional payment routes
    Route::get('/payments/invoice/{invoiceId}', [PaymentController::class, 'getByInvoice'])->name('payments.by-invoice');
    Route::get('/payments/patient/{patientId}', [PaymentController::class, 'getByPatient'])->name('payments.by-patient');
    Route::get('/payments/reports/daily', [PaymentController::class, 'getDailyReport'])->name('payments.daily-report');
});

require __DIR__.'/settings.php';
