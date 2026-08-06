<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('experiences.manage');

        $experiences = Experience::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('admin/experiences/index', [
            'experiences' => $experiences,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('experiences.manage');

        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'period' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $experience = Experience::create($validated);

        ActivityLogger::log('EXPERIENCE_CREATED', "Added professional experience '{$experience->job_title}' at '{$experience->company}'");

        return redirect()->route('admin.experiences.index')->with('success', 'Experience entry created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Experience $experience): RedirectResponse
    {
        Gate::authorize('experiences.manage');

        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'period' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $experience->update($validated);

        ActivityLogger::log('EXPERIENCE_UPDATED', "Updated professional experience '{$experience->job_title}' at '{$experience->company}'");

        return redirect()->route('admin.experiences.index')->with('success', 'Experience entry updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Experience $experience): RedirectResponse
    {
        Gate::authorize('experiences.manage');

        $title = $experience->job_title;
        $company = $experience->company;
        $experience->delete();

        ActivityLogger::log('EXPERIENCE_DELETED', "Deleted professional experience '{$title}' at '{$company}'");

        return redirect()->route('admin.experiences.index')->with('success', 'Experience entry deleted successfully!');
    }
}
