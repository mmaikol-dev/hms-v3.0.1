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
            'description' => 'nullable|string',
        ]);

        $path = $request->file('file')->store('attachments');

        Attachment::create([
            'patient_id' => $request->patient_id,
            'file_path'  => $path,
            'description' => $request->description,
        ]);

        return redirect()->route('attachments.index')->with('success', 'Attachment uploaded');
    }

    public function show(Attachment $attachment)
    {
        return Inertia::render('attachments/show', [
            'attachment' => $attachment->load('patient')
        ]);
    }

    public function destroy(Attachment $attachment)
    {
        Storage::delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted');
    }
}
