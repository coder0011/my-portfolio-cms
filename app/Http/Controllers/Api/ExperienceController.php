<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ExperienceController extends Controller
{
    /**
     * Get all experience timeline entries.
     */
    public function index(): JsonResponse
    {
        $experiences = Cache::rememberForever('portfolio_experiences', function () {
            return Experience::orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $experiences
        ]);
    }
}
