<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProjectController extends Controller
{
    /**
     * Get portfolio projects.
     */
    public function index(Request $request): JsonResponse
    {
        $isFeaturedQuery = $request->has('featured') && (filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN) || $request->query('featured') == 1);
        $cacheKey = $isFeaturedQuery ? 'portfolio_projects_featured' : 'portfolio_projects_all';

        $projects = Cache::rememberForever($cacheKey, function () use ($isFeaturedQuery) {
            $query = Project::orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc');

            if ($isFeaturedQuery) {
                $query->where('is_featured', true);
            }

            return $query->get()->map(function ($project) {
                // Qualify the main thumbnail image path if it's a relative storage path
                if ($project->image_path && (str_starts_with($project->image_path, '/storage') || str_starts_with($project->image_path, 'storage/'))) {
                    $project->image_path = asset($project->image_path);
                }
                return $project;
            })->toArray();
        });

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }
}
