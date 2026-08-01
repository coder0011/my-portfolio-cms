<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
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
    public function store(Request $request): RedirectResponse
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
            $cmsDir = public_path('storage/' . $projectFolder);
            @mkdir($cmsDir, 0755, true);

            foreach ($request->file('new_images') as $file) {
                $filename = strtolower($projectFolder . '-' . date('Y-m-d') . '-' . uniqid() . '.' . $file->getClientOriginalExtension());
                $file->move($cmsDir, $filename);
                
                // If there's no thumbnail set, mark the first uploaded image as thumbnail
                if (empty($validated['image_path'])) {
                    $validated['image_path'] = '/storage/' . $projectFolder . '/' . $filename;
                }
            }
        }

        Project::create($validated);

        return redirect()->route('admin.projects.index')->with('success', 'Project created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project): RedirectResponse
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

        $cmsDir = public_path('storage/' . $projectFolder);

        // Handle deleted images
        if ($request->has('deleted_images')) {
            foreach ($request->input('deleted_images') as $imagePath) {
                $filename = basename($imagePath);
                @unlink($cmsDir . '/' . $filename);
                
                // If deleted image was the thumbnail, reset image_path
                if ($project->image_path === $imagePath || ($validated['image_path'] ?? null) === $imagePath) {
                    $validated['image_path'] = null;
                }
            }
        }

        // Handle new uploads
        if ($request->hasFile('new_images')) {
            @mkdir($cmsDir, 0755, true);

            foreach ($request->file('new_images') as $file) {
                $filename = strtolower($projectFolder . '-' . date('Y-m-d') . '-' . uniqid() . '.' . $file->getClientOriginalExtension());
                $file->move($cmsDir, $filename);

                // If thumbnail is empty, default to the first newly uploaded image
                if (empty($validated['image_path']) && empty($project->image_path)) {
                    $validated['image_path'] = '/storage/' . $projectFolder . '/' . $filename;
                }
            }
        }

        $project->update($validated);

        return redirect()->route('admin.projects.index')->with('success', 'Project updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('projects.manage');

        $project->delete();

        return redirect()->route('admin.projects.index')->with('success', 'Project deleted successfully!');
    }
}
