<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Lab Test Report</title>

    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
            color: #333;
        }

        h1 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 20px;
        }

        .section-title {
            margin-top: 25px;
            font-size: 18px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
        }

        .row {
            margin: 10px 0;
        }

        .label {
            font-weight: bold;
            width: 150px;
            display: inline-block;
        }

        .value {
            display: inline-block;
        }

        .box {
            padding: 10px;
            background: #f5f5f5;
            border-radius: 6px;
            margin-top: 10px;
        }
    </style>
</head>

<body>

    <h1>Lab Test Report</h1>

    <div class="section">
        <div class="section-title">Request Details</div>
        <div class="row"><span class="label">Request #:</span> <span
                class="value">{{ $labTestRequest->request_number }}</span></div>
        <div class="row"><span class="label">Status:</span> <span
                class="value">{{ ucfirst($labTestRequest->status) }}</span></div>
        <div class="row"><span class="label">Requested Date:</span> <span
                class="value">{{ $labTestRequest->requested_date }}</span></div>
    </div>

    <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="row"><span class="label">Name:</span> <span
                class="value">{{ $labTestRequest->patient->user->name ?? 'N/A' }}</span></div>
        <div class="row"><span class="label">Patient ID:</span> <span
                class="value">{{ $labTestRequest->patient->patient_id }}</span></div>
    </div>

    <div class="section">
        <div class="section-title">Lab Test</div>
        <div class="row"><span class="label">Test Name:</span> <span
                class="value">{{ $labTestRequest->labTest->test_name }}</span></div>
        <div class="row"><span class="label">Test Code:</span> <span
                class="value">{{ $labTestRequest->labTest->test_code }}</span></div>
    </div>

    @if ($labTestRequest->result)
        <div class="section">
            <div class="section-title">Test Result</div>
            <div class="box">
                {!! nl2br(e($labTestRequest->result)) !!}
            </div>
        </div>
    @endif

    @if ($labTestRequest->notes)
        <div class="section">
            <div class="section-title">Notes</div>
            <div class="box">
                {!! nl2br(e($labTestRequest->notes)) !!}
            </div>
        </div>
    @endif

</body>

</html>
