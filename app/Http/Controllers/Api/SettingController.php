<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SettingController extends Controller
{
    /**
     * Get all public settings.
     */
    public function index()
    {
        $keys = ['site_name', 'site_logo', 'site_favicon', 'admin_logo', 'admin_icon'];
        $settings = [];

        foreach ($keys as $key) {
            $value = Setting::get($key);
            
            // Prepend asset path if it's a file
            if ($value && str_starts_with($value, '/storage')) {
                $value = asset($value);
            }
            
            $settings[$key] = $value;
        }

        return response()->json($settings);
    }
}
