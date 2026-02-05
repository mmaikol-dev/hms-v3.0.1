<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function index()
    {
        return Inertia::render('attachments/index', [
            'attachments' => Attachment::with('patient')->latest()->paginate(20)
        ]);
    }

    public function create()
    {
        return Inertia::render('attachments/create', [
            'patients' => Patient::select('id','first_name','last_name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'file' => 'required|file|mimes:jpg,png,pdf,docx',
        ]);

        $path = $request->file('file')->store('attachments');

        Attachment::create([
            'patient_id' => $request->patient_id,
            'file_name' => $request->file('file')->getClientOriginalName(),
            'file_path'  => $path,
        ]);

        return redirect()->route('attachments.index')->with('success', 'Attachment uploaded');
    }

    public function show(Attachment $attachment)
    {
        return Inertia::render('attachments/show', [
            'attachment' => $attachment->load('patient')
        ]);
    }

    public function edit(Attachment $attachment)
    {
        return Inertia::render('attachments/edit', [
            'attachment' => $attachment->load('patient'),
            'patients' => Patient::select('id', 'first_name', 'last_name')->get(),
        ]);
    }

    public function update(Request $request, Attachment $attachment)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'file' => 'nullable|file|mimes:jpg,png,pdf,docx',
        ]);

        $data = [
            'patient_id' => $validated['patient_id'],
        ];

        if ($request->hasFile('file')) {
            Storage::delete($attachment->file_path);
            $path = $request->file('file')->store('attachments');
            $data['file_name'] = $request->file('file')->getClientOriginalName();
            $data['file_path'] = $path;
        }

        $attachment->update($data);

        return redirect()->route('attachments.show', $attachment)->with('success', 'Attachment updated');
    }

    public function destroy(Attachment $attachment)
    {
        Storage::delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted');
    }
}
