<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Get all public settings.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::getPublicSettings();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
}
