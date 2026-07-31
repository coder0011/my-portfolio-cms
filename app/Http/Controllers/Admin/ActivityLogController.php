<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs.
     */
    public function index(): Response
    {
        Gate::authorize('logs.view');

        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
        ]);
    }
}
