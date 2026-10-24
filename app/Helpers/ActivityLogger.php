<?php

namespace App\Helpers;

use App\Models\ActivityLog;

class ActivityLogger
{
    /**
     * Log a user activity action to the database.
     */
    public static function log(string $action, string $description, ?int $userId = null): void
    {
        try {
            ActivityLog::create([
                'user_id' => $userId ?? auth()->id(),
                'action' => $action,
                'description' => $description,
                'ip_address' => request()->ip(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('ActivityLogger failed: '.$e->getMessage());
        }
    }
}
