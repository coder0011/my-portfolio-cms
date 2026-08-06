<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('projects.manage');

        $projects = Project::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, ImageService $imageService): RedirectResponse
    {
        Gate::authorize('projects.manage');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'link' => 'nullable|string|max:255',
            'links_additional' => 'nullable|array',
            'description' => 'required|string',
            'image_path' => 'nullable|string|max:255',
            'project_folder' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|max:5120',
        ]);

        $projectFolder = $validated['project_folder'] ?? null;
        if (empty($projectFolder)) {
            $projectFolder = str($validated['title'])->slug()->toString();
            $validated['project_folder'] = $projectFolder;
        }

        // Handle multiple image uploads
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $file) {
                $url = $imageService->upload($file, 'public/frontend/images/portfolio/'.$projectFolder);

                // If there's no thumbnail set, mark the first uploaded image as thumbnail
                if (empty($validated['image_path'])) {
                    $validated['image_path'] = $url;
                }
            }
        }

        $project = Project::create($validated);

        ActivityLogger::log('PROJECT_CREATED', "Added project '{$project->title}'");

        return redirect()->route('admin.projects.index')->with('success', 'Project created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project, ImageService $imageService): RedirectResponse
    {
        Gate::authorize('projects.manage');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'link' => 'nullable|string|max:255',
            'links_additional' => 'nullable|array',
            'description' => 'required|string',
            'image_path' => 'nullable|string|max:255',
            'project_folder' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|max:5120',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'string',
        ]);

        $projectFolder = $project->project_folder;
        if (empty($projectFolder)) {
            $projectFolder = $validated['project_folder'] ?? str($validated['title'])->slug()->toString();
            $validated['project_folder'] = $projectFolder;
        }

        $cmsDir = public_path('storage/frontend/images/portfolio/'.$projectFolder);

        // Handle deleted images
        if ($request->has('deleted_images')) {
            foreach ($request->input('deleted_images') as $imagePath) {
                $filename = basename($imagePath);
                @unlink($cmsDir.'/'.$filename);

                // If deleted image was the thumbnail, reset image_path
                if ($project->image_path === $imagePath || ($validated['image_path'] ?? null) === $imagePath) {
                    $validated['image_path'] = null;
                }
            }
        }

        // Handle new uploads
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $file) {
                $url = $imageService->upload($file, 'public/frontend/images/portfolio/'.$projectFolder);

                // If thumbnail is empty, default to the first newly uploaded image
                if (empty($validated['image_path']) && empty($project->image_path)) {
                    $validated['image_path'] = $url;
                }
            }
        }

        $project->update($validated);

        ActivityLogger::log('PROJECT_UPDATED', "Updated project details of '{$project->title}'");

        return redirect()->route('admin.projects.index')->with('success', 'Project updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('projects.manage');

        $title = $project->title;
        $project->delete();

        ActivityLogger::log('PROJECT_DELETED', "Deleted project '{$title}'");

        return redirect()->route('admin.projects.index')->with('success', 'Project deleted successfully!');
    }
}
