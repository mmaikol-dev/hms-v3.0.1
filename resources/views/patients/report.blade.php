<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Patient Report</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 13px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 25px;
            border-bottom: 1px solid #333;
            padding-bottom: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        table td,
        table th {
            padding: 6px;
            border: 1px solid #ccc;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            width: 25%;
            background: #f1f1f1;
        }
    </style>
</head>

<body>

    <div class="header">
        <h2>Patient Medical Report</h2>
    </div>

    {{-- BASIC INFO --}}
    <div class="section-title">Patient Information</div>
    <table>
        <tr>
            <td class="label">Patient ID</td>
            <td>{{ $patient->patient_id }}</td>
        </tr>
        <tr>
            <td class="label">Name</td>
            <td>{{ $patient->first_name }} {{ $patient->last_name }}</td>
        </tr>
        <tr>
            <td class="label">Email</td>
            <td>{{ $patient->email }}</td>
        </tr>
        <tr>
            <td class="label">Phone</td>
            <td>{{ $patient->phone }}</td>
        </tr>
        <tr>
            <td class="label">Gender</td>
            <td>{{ ucfirst($patient->gender) }}</td>
        </tr>
        <tr>
            <td class="label">Blood Group</td>
            <td>{{ $patient->blood_group ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Date of Birth</td>
            <td>{{ $patient->date_of_birth }}</td>
        </tr>
        <tr>
            <td class="label">Address</td>
            <td>{{ $patient->address }}, {{ $patient->city }}, {{ $patient->state }}</td>
        </tr>
    </table>

    {{-- APPOINTMENTS --}}
    @if ($patient->appointments->count())
        <div class="section-title">Appointments</div>
        <table>
            <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Notes</th>
            </tr>
            @foreach ($patient->appointments as $appt)
                <tr>
                    <td>{{ $appt->appointment_date }}</td>
                    <td>{{ $appt->doctor?->name }}</td>
                    <td>{{ $appt->notes }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    {{-- LAB TEST REQUESTS --}}
    @if ($patient->labTestRequests->count())
        <div class="section-title">Lab Test Requests</div>
        <table>
            <tr>
                <th>Test</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Result</th>
            </tr>
            @foreach ($patient->labTestRequests as $lab)
                <tr>
                    <td>{{ $lab->labTest->test_name }}</td>
                    <td>{{ $lab->status }}</td>
                    <td>{{ $lab->requested_date }}</td>
                    <td>{{ $lab->result ?? 'Pending' }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    {{-- INVOICES --}}
    @if ($patient->invoices->count())
        <div class="section-title">Invoices</div>
        <table>
            <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
            </tr>
            @foreach ($patient->invoices as $inv)
                <tr>
                    <td>{{ $inv->invoice_number }}</td>
                    <td>{{ $inv->created_at }}</td>
                    <td>{{ $inv->total_amount }}</td>
                    <td>{{ $inv->status }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    <br><br>

    <div style="text-align:center; font-size:12px; color:#777;">
        Generated on {{ now() }}
    </div>

</body>

</html>
