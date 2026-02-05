<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #fff;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #0066cc;
            border-radius: 8px;
            padding: 25px;
            background: #fff;
            box-sizing: border-box;
            position: relative;
        }
        
        .hospital-header {
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        
        .hospital-header h1 {
            color: #0066cc;
            font-size: 26px;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .hospital-header .subtitle {
            color: #666;
            font-size: 13px;
            margin: 4px 0;
        }
        
        .hospital-info {
            text-align: center;
            margin-bottom: 15px;
            color: #555;
            font-size: 11px;
            line-height: 1.4;
        }
        
        /* UPDATED: Side by side layout */
        .info-container {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }
        
        .info-box {
            flex: 1;
            min-width: 300px;
            box-sizing: border-box;
        }
        
        .info-box h2 {
            color: #0066cc;
            font-size: 16px;
            margin: 0 0 12px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 6px;
            align-items: start;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            text-align: right;
            padding-right: 10px;
        }
        
        .info-value {
            color: #333;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
        }
        
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-paid { background-color: #d4edda; color: #155724; }
        .status-overdue { background-color: #f8d7da; color: #721c24; }
        
        .items-section {
            margin: 25px 0;
            overflow-x: auto;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            table-layout: fixed;
        }
        
        .items-table th {
            background-color: #0066cc;
            color: white;
            font-weight: bold;
            padding: 10px 8px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
        }
        
        /* Fixed column widths */
        .items-table th:nth-child(1), 
        .items-table td:nth-child(1) { width: 40px; }
        .items-table th:nth-child(2), 
        .items-table td:nth-child(2) { width: 90px; }
        .items-table th:nth-child(3), 
        .items-table td:nth-child(3) { width: auto; }
        .items-table th:nth-child(4), 
        .items-table td:nth-child(4) { width: 60px; text-align: center; }
        .items-table th:nth-child(5), 
        .items-table td:nth-child(5) { width: 90px; text-align: right; }
        .items-table th:nth-child(6), 
        .items-table td:nth-child(6) { width: 100px; text-align: right; }
        
        .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .type-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
        }
        
        .type-consultation { background-color: #e3f2fd; color: #1565c0; }
        .type-medicine { background-color: #e8f5e9; color: #2e7d32; }
        .type-lab_test { background-color: #fff3e0; color: #ef6c00; }
        .type-bed_charge { background-color: #f3e5f5; color: #7b1fa2; }
        .type-procedure { background-color: #e0f2f1; color: #00695c; }
        .type-ambulance { background-color: #fff8e1; color: #ff8f00; }
        .type-other { background-color: #f5f5f5; color: #616161; }
        
        .summary-section {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 18px;
            margin: 20px 0;
            border-left: 4px solid #0066cc;
            position: relative;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
        }
        
        .summary-item.total {
            font-size: 14px;
            font-weight: bold;
            color: #0066cc;
            border-top: 2px solid #ddd;
            padding-top: 12px;
            margin-top: 8px;
        }
        
        .summary-item.balance {
            font-size: 13px;
            font-weight: bold;
            color: #dc3545;
        }
        
        .payment-status {
            background-color: #e9f7ff;
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
        }
        
        .notes-section {
            background-color: #fff8e1;
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
            border-left: 4px solid #ffc107;
        }
        
        /* Stamp Section Styles */
        .stamp-section {
            margin: 25px 0;
            text-align: center;
            page-break-inside: avoid;
        }
        
        .stamp-container {
            display: inline-block;
            position: relative;
            margin: 20px auto;
            padding: 15px;
            text-align: center;
        }
        
        .official-stamp {
            display: inline-block;
            filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1));
        }
        
        .stamp-label {
            margin-top: 8px;
            font-size: 11px;
            color: #555;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stamp-divider {
            border-top: 2px dashed #ddd;
            margin: 30px 0 20px 0;
            position: relative;
        }
        
        .stamp-divider::before {
            content: "OFFICIAL STAMP";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 15px;
            font-size: 10px;
            color: #888;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
            text-align: center;
        }
        
        .footer-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .footer-column h4 {
            color: #0066cc;
            margin: 0 0 8px 0;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .important-info {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin: 15px 0;
            border: 1px dashed #ddd;
        }
        
        @media (max-width: 768px) {
            .info-container {
                flex-direction: column;
            }
            
            .info-box {
                min-width: 100%;
            }
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            
            .invoice-container {
                border: none;
                padding: 15px;
                max-width: 100%;
            }
            
            .info-container {
                display: flex;
                flex-wrap: nowrap;
            }
            
            .info-box {
                min-width: 300px;
            }
            
            .items-table {
                page-break-inside: avoid;
            }
            
            .summary-section {
                page-break-inside: avoid;
            }
            
            .stamp-section {
                page-break-inside: avoid;
            }
            
            .official-stamp {
                filter: none !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            @page {
                size: A4;
                margin: 20mm;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Hospital Header -->
        <div class="hospital-header">
            <img
                    src="{{ public_path('storage/invoices/logo.png') }}"
                    alt="PERISQUIRE CLINICS & LABORATORIES"
                    class="logo-img"
                    style="width: 295px; height: 250px; object-fit: contain; opacity: 0.85;"
                    >
            <div class="subtitle">Medical Services Invoice</div>
            <div class="hospital-info">
                P.O. Box 997 – 00100 GPO Nairobi, Kenya<br>
                Phone: +254 723 00 77 22 | Website: www.perisquireclinics.laboratories.com<br>
                License: MED-12345-LIC | Tax ID: 12-3456789
            </div>
        </div>
        
        <!-- UPDATED: Invoice and Patient Info Side by Side -->
        <div class="info-container">
            <!-- Left Box: Invoice Details -->
            <div class="info-box">
                <h2>Invoice Details</h2>
                <div class="info-grid">
                    <div class="info-label">Invoice Number:</div>
                    <div class="info-value">{{ $invoice->invoice_number }}</div>
                    
                    <div class="info-label">Invoice Date:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($invoice->invoice_date)->format('M d, Y, g:i A') }}</div>
                    
                    
                    <div class="info-label">Status:</div>
                    <div class="info-value">
                        @if($invoice->status === 'paid')
                            <span class="status-badge status-paid">Paid</span>
                        @elseif(\Carbon\Carbon::parse($invoice->due_date)->isPast())
                            <span class="status-badge status-overdue">Overdue</span>
                        @else
                            <span class="status-badge status-pending">Pending</span>
                        @endif
                    </div>
                    
                    <div class="info-label">Payer Account:</div>
                    <div class="info-value">OFFICE OF THE AUDITOR GENERAL</div>
                    
                    <div class="info-label">Policy:</div>
                    <div class="info-value">OFFICE OF THE AUDITOR GENERAL</div>
                    
                    <div class="info-label">Scheme:</div>
                    <div class="info-value">ISIOLO COUNTY</div>
                </div>
            </div>
            
            <!-- Right Box: Patient Information -->
            <div class="info-box">
                <h2>Patient Information</h2>
                <div class="info-grid">
                    <div class="info-label">Patient Name:</div>
                    <div class="info-value">{{ $invoice->patient->first_name }} {{ $invoice->patient->last_name }}</div>
                    
                    <div class="info-label">Patient ID:</div>
                    <div class="info-value">PAT-{{ str_pad($invoice->patient->id, 6, '0', STR_PAD_LEFT) }}</div>
                    
                    <div class="info-label">File No:</div>
                    <div class="info-value">
                        @if(isset($invoice->patient->file_no) && $invoice->patient->file_no)
                            {{ $invoice->patient->file_no }}
                        @else
                            N/A
                        @endif
                    </div>
                    
                    <div class="info-label">Member No:</div>
                    <div class="info-value">
                        @if(isset($invoice->member_no) && $invoice->member_no)
                            {{ $invoice->member_no }}
                        @else
                            N/A
                        @endif
                    </div>
                    
                   
                    
                    <div class="info-label">Billing Address:</div>
                    <div class="info-value">
                        @if($invoice->patient->address)
                            {{ $invoice->patient->address }}<br>
                            @if($invoice->patient->city && $invoice->patient->state)
                                {{ $invoice->patient->city }}, {{ $invoice->patient->state }} {{ $invoice->patient->zip_code ?? '' }}
                            @endif
                        @else
                            Not specified
                        @endif
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Medical Services Table -->
        @if($invoice->items->count() > 0)
        <div class="items-section">
            <h2 style="color: #0066cc; font-size: 15px; margin-bottom: 12px;">Medical Services & Charges</h2>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Description / Procedure</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>
                            <span class="type-badge type-{{ $item->item_type }}">
                                {{ str_replace('_', ' ', ucfirst($item->item_type)) }}
                            </span>
                        </td>
                        <td>{{ $item->description }}</td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">KES{{ number_format($item->unit_price, 2) }}</td>
                        <td style="text-align: right; font-weight: bold;">KES{{ number_format($item->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif
        
        <!-- Financial Summary -->
        <div class="summary-section">
            <h3 style="color: #0066cc; margin: 0 0 15px 0; font-size: 14px;">Financial Summary</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span>KES {{ number_format($invoice->subtotal, 2) }}</span>
                </div>
                <div class="summary-item">
                    <span>Tax ({{ $invoice->tax_amount > 0 ? 'Included' : '0%' }}):</span>
                    <span>KES {{ number_format($invoice->tax_amount, 2) }}</span>
                </div>
                <div class="summary-item">
                    <span>Discount:</span>
                    <span>-KES {{ number_format($invoice->discount_amount, 2) }}</span>
                </div>
                <div class="summary-item total">
                    <span>Total Charges:</span>
                    <span>KES {{ number_format($invoice->total_amount, 2) }}</span>
                </div>
            </div>
            
            <!-- Payment Status -->
            <div class="payment-status">
                <div class="summary-item">
                    <span>Amount Paid:</span>
                    <span style="color: #28a745;">KES {{ number_format($invoice->paid_amount, 2) }}</span>
                </div>
                <div class="summary-item balance">
                    <span>Balance Due:</span>
                    <span>KES {{ number_format($invoice->total_amount - $invoice->paid_amount, 2) }}</span>
                </div>
                
                @if($invoice->payments->count() > 0)
                <div style="margin-top: 12px; font-size: 11px;">
                    <strong>Payment History:</strong>
                    @foreach($invoice->payments as $payment)
                        <div style="margin-top: 4px;">
                            {{ \Carbon\Carbon::parse($payment->payment_date)->format('m/d/Y') }}: 
                            KES{{ number_format($payment->amount, 2) }} 
                            ({{ $payment->payment_method }})
                            @if($payment->receivedBy)
                                - Received by: {{ $payment->receivedBy->name }}
                            @endif
                        </div>
                    @endforeach
                </div>
                @endif
            </div>
        </div>
        
        <!-- Stamp Section -->
        <div class="stamp-divider"></div>
        
        <div class="stamp-section">
            <div class="stamp-container">
                <div class="official-stamp">
                    <img
                        src="{{ public_path('storage/invoices/stamp.png') }}"
                        alt="Official Stamp"
                        style="width: 250px; height: 150px; object-fit: contain; opacity: 0.85;">
                </div>
                <div class="stamp-label">Official Hospital Stamp</div>
            </div>
        </div>
        
        <!-- Notes Section -->
        @if($invoice->notes)
        <div class="notes-section">
            <h4 style="margin: 0 0 8px 0; color: #ff9800; font-size: 12px;">Medical Notes & Instructions</h4>
            <p style="margin: 0;">{{ $invoice->notes }}</p>
        </div>
        @endif
        
        <!-- Important Information -->
        <div class="important-info">
            <h4 style="margin: 0 0 8px 0; color: #0066cc; font-size: 11px;">IMPORTANT INFORMATION</h4>
            <div style="font-size: 10px; color: #666;">
                <p style="margin: 4px 0;">
                    <strong>Payment Methods Accepted:</strong> Credit Card, Debit Card, Insurance, Cash, Bank Transfer
                </p>
                <p style="margin: 4px 0;">
                    <strong>Late Payment:</strong> Accounts overdue by 30 days may be subject to a 1.5% monthly service charge.
                </p>
                <p style="margin: 4px 0;">
                    <strong>Insurance Claims:</strong> Please submit this invoice to your insurance provider within 30 days.
                </p>
                <p style="margin: 4px 0;">
                    <strong>Questions?</strong> Contact our billing department at +254 723 00 77 22 or visit www.perisquireclinics.laboratories.com
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-grid">
                <div class="footer-column">
                    <h4>Clinic Contact</h4>
                    Phone: +254 723 00 77 22<br>
                    P.O. Box 997 – 00100 GPO<br>
                    Nairobi, Kenya
                </div>
                
                <div class="footer-column">
                    <h4>Billing Department</h4>
                    Mon-Fri: 8:00 AM - 5:00 PM<br>
                    Phone: +254 723 00 77 22<br>
                    Website: www.perisquireclinics.laboratories.com
                </div>
                
                <div class="footer-column">
                    <h4>Insurance</h4>
                    We accept most major insurance plans.<br>
                    Please verify coverage with your provider.
                </div>
            </div>
            
            <div style="font-size: 9px; color: #999; margin-top: 12px;">
                This is an official medical invoice from {{ config('app.name', 'Perisquire Clinics & Laboratories') }}. 
                Payment is due within {{ \Carbon\Carbon::parse($invoice->due_date)->diffInDays($invoice->invoice_date) }} days of invoice date.
                Invoice generated electronically on {{ $date }}.
            </div>
        </div>
    </div>
</body>
</html>