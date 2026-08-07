<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Education;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class EducationController extends Controller
{
    /**
     * Get all education timeline entries.
     */
    public function index(): JsonResponse
    {
        $educations = Cache::rememberForever('portfolio_educations', function () {
            return Education::orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => $educations,
        ]);
    }
}
