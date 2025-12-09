<?php

namespace App\Http\Controllers;

use App\Models\ActivityLogs;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'action' => 'required|string|max:100',
            'model_type' => 'nullable|string|max:255',
            'model_id' => 'nullable|integer',
            'description' => 'required|string',
            'ip_address' => 'nullable|ip',
            'user_agent' => 'nullable|string',
            'properties' => 'nullable|array'
        ]);

        $log = ActivityLog::create($validated);
        return response()->json($log, 201);
    }

    public function show($id)
    {
        $log = ActivityLog::with(['user', 'subject'])->findOrFail($id);
        return response()->json($log);
    }

    public function getByUser($userId)
    {
        $logs = ActivityLog::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        return response()->json($logs);
    }

    public function getByModel($modelType, $modelId)
    {
        $logs = ActivityLog::with('user')
            ->where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($logs);
    }

    public function search(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);
        return response()->json($logs);
    }

    public function destroy($id)
    {
        $log = ActivityLog::findOrFail($id);
        $log->delete();
        return response()->json(['message' => 'Activity log deleted successfully']);
    }

    public function deleteOld(Request $request)
    {
        $days = $request->input('days', 90);
        $date = now()->subDays($days);
        
        $deleted = ActivityLog::where('created_at', '<', $date)->delete();
        
        return response()->json([
            'message' => "Deleted {$deleted} activity logs older than {$days} days"
        ]);
    }
}