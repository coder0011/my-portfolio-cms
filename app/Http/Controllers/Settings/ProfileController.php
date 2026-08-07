<?php

namespace App\Http\Controllers\Settings;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Models\Education;
use App\Models\Post;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'adminSettings' => [
                'admin_logo' => Setting::get('admin_logo'),
                'admin_icon' => Setting::get('admin_icon'),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|image|max:2048',
            'admin_logo' => 'nullable|file|mimes:svg,png,jpg,jpeg,webp|max:2048',
            'admin_icon' => 'nullable|file|mimes:svg,png,jpg,jpeg,webp|max:2048',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->bio = $validated['bio'] ?? null;

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }
            $path = $request->file('avatar')->store('blogs/avatars', 'public');
            if ($path !== false) {
                $user->avatar = '/storage/'.$path;
            }
        }

        $user->save();

        // Handle Admin Brand Logo
        if ($request->hasFile('admin_logo')) {
            $oldLogo = Setting::get('admin_logo');
            if ($oldLogo && str_starts_with($oldLogo, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo));
            }

            $file = $request->file('admin_logo');
            $date = date('Y-m-d');
            $filename = strtolower('backend-logo-'.$date.'.'.$file->getClientOriginalExtension());
            $path = $file->storeAs('backend', $filename, 'public');

            if ($path !== false) {
                Setting::set('admin_logo', '/storage/'.$path);
            }
        }

        // Handle Admin Brand Icon
        if ($request->hasFile('admin_icon')) {
            $oldIcon = Setting::get('admin_icon');
            if ($oldIcon && str_starts_with($oldIcon, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldIcon));
            }

            $file = $request->file('admin_icon');
            $date = date('Y-m-d');
            $filename = strtolower('backend-icon-'.$date.'.'.$file->getClientOriginalExtension());
            $path = $file->storeAs('backend', $filename, 'public');

            if ($path !== false) {
                Setting::set('admin_icon', '/storage/'.$path);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated successfully.')]);

        return to_route('profile.edit');
    }

    /**
     * Show the portfolio/website configuration page.
     */
    public function editPortfolio(Request $request): Response
    {
        return Inertia::render('settings/portfolio', [
            'siteSettings' => [
                'site_name' => Setting::get('site_name', config('app.name')),
                'site_logo' => Setting::get('site_logo'),
                'site_favicon' => Setting::get('site_favicon'),
                'site_meta_title' => Setting::get('site_meta_title'),
                'site_meta_description' => Setting::get('site_meta_description'),
                'owner_name' => Setting::get('owner_name'),
                'owner_title' => Setting::get('owner_title'),
                'owner_bio_short' => Setting::get('owner_bio_short'),
                'owner_bio_long' => Setting::get('owner_bio_long'),
                'contact_email' => Setting::get('contact_email'),
                'contact_phone' => Setting::get('contact_phone'),
                'contact_location' => Setting::get('contact_location'),
                'contact_address' => Setting::get('contact_address'),
                'google_map_link' => Setting::get('google_map_link'),
                'total_experience' => Setting::get('total_experience'),

                'cv_file_path' => Setting::get('cv_file_path'),
                'social_links' => json_decode(Setting::get('social_links', '[]'), true) ?: [],
                'webp_conversion_enabled' => filter_var(Setting::get('webp_conversion_enabled', true), FILTER_VALIDATE_BOOLEAN),
                'keep_original_image' => filter_var(Setting::get('keep_original_image', false), FILTER_VALIDATE_BOOLEAN),
            ],
        ]);
    }

    /**
     * Update the portfolio/website configuration.
     */
    public function updatePortfolio(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Site Settings basic assets
            'site_name' => 'nullable|string|max:255',
            'site_logo' => 'nullable|file|mimes:svg,png,jpg,jpeg,webp|max:2048',
            'site_favicon' => 'nullable|file|mimes:svg,png,jpg,jpeg,webp|max:1024',

            // Site Metadata
            'site_meta_title' => 'nullable|string|max:255',
            'site_meta_description' => 'nullable|string|max:1000',

            // Owner Details
            'owner_name' => 'nullable|string|max:255',
            'owner_title' => 'nullable|string|max:255',
            'owner_bio_short' => 'nullable|string|max:1000',
            'owner_bio_long' => 'nullable|string|max:5000',

            'total_experience' => 'nullable|string|max:255',

            // Contact Details
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'contact_location' => 'nullable|string|max:255',
            'contact_address' => 'nullable|string|max:500',
            'google_map_link' => 'nullable|string|max:2048',

            // Resume File (PDF only)
            'cv_file_path' => 'nullable|file|mimes:pdf|max:10240',

            // Dynamic Social Profiles
            'social_links' => 'nullable|array',
            'social_links.*.icon' => 'nullable|string|max:2048',
            'social_links.*.icon_file' => 'nullable|file|mimes:svg,png,jpg,jpeg,webp|max:2048',
            'social_links.*.name' => 'required|string|max:255',
            'social_links.*.url' => 'required|string|max:2048',
            'social_links.*.sort_order' => 'required|integer',

            // WebP Image Optimization Settings
            'webp_conversion_enabled' => 'nullable|boolean',
            'keep_original_image' => 'nullable|boolean',
        ]);

        // Update settings text fields
        $settingsTextKeys = [
            'site_name', 'site_meta_title', 'site_meta_description',
            'owner_name', 'owner_title', 'owner_bio_short', 'owner_bio_long',
            'total_experience',
            'contact_email', 'contact_phone', 'contact_location', 'contact_address', 'google_map_link',
        ];

        foreach ($settingsTextKeys as $textKey) {
            if ($request->has($textKey)) {
                Setting::set($textKey, $validated[$textKey] ?? null);
            }
        }

        Setting::set('webp_conversion_enabled', $request->boolean('webp_conversion_enabled') ? '1' : '0');
        Setting::set('keep_original_image', $request->boolean('keep_original_image') ? '1' : '0');

        if ($request->has('social_links')) {
            $socialLinks = $validated['social_links'] ?? [];

            foreach ($socialLinks as $index => &$link) {
                // If a new icon file has been uploaded for this profile
                if ($request->hasFile("social_links.{$index}.icon_file")) {
                    $file = $request->file("social_links.{$index}.icon_file");

                    // Rename with lowercase slug name and date
                    $slugName = str($link['name'])->slug()->toString();
                    $date = date('Y-m-d');
                    $filename = strtolower($slugName.'-'.$date.'.'.$file->getClientOriginalExtension());

                    // Save in CMS public storage
                    $path = $file->storeAs('frontend/social-icons', $filename, 'public');
                    if ($path !== false) {
                        $link['icon'] = '/storage/'.$path;
                    }
                }

                // Strip the temporary File object reference before database storage
                unset($link['icon_file']);
            }
            unset($link);

            Setting::set('social_links', json_encode($socialLinks) ?: '[]');
        }

        // Handle CV file upload
        if ($request->hasFile('cv_file_path')) {
            $oldCv = Setting::get('cv_file_path');
            if ($oldCv && str_starts_with($oldCv, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldCv));
            }

            $file = $request->file('cv_file_path');
            $date = date('Y-m-d');
            $filename = strtolower('cv-'.$date.'.'.$file->getClientOriginalExtension());
            $path = $file->storeAs('frontend/cv', $filename, 'public');

            if ($path !== false) {
                Setting::set('cv_file_path', '/storage/'.$path);
            }
        }

        // Handle Site Logo file upload
        if ($request->hasFile('site_logo')) {
            $oldLogo = Setting::get('site_logo');
            if ($oldLogo && str_starts_with($oldLogo, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo));
            }

            $file = $request->file('site_logo');
            $date = date('Y-m-d');
            $filename = strtolower('site-logo-'.$date.'.'.$file->getClientOriginalExtension());
            $path = $file->storeAs('frontend/logo', $filename, 'public');

            if ($path !== false) {
                Setting::set('site_logo', '/storage/'.$path);
            }
        }

        // Handle Site Favicon file upload
        if ($request->hasFile('site_favicon')) {
            $oldFavicon = Setting::get('site_favicon');
            if ($oldFavicon && str_starts_with($oldFavicon, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldFavicon));
            }

            $file = $request->file('site_favicon');
            $date = date('Y-m-d');
            $filename = strtolower('site-favicon-'.$date.'.'.$file->getClientOriginalExtension());
            $path = $file->storeAs('frontend/favicon', $filename, 'public');

            if ($path !== false) {
                Setting::set('site_favicon', '/storage/'.$path);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Portfolio settings updated successfully.')]);

        return to_route('portfolio.edit');
    }

    /**
     * Purge application data cache and regenerate core listing caches.
     */
    public function purgeCache(Request $request): RedirectResponse
    {
        // 1. Flush application data cache
        Cache::flush();

        // 2. Regenerate essential portfolio caches
        Education::regenerateCache();
        Project::regenerateCache();
        Setting::regenerateCache();
        Post::regenerateSliderCache();

        // 3. Log the cache purge activity
        ActivityLogger::log('DATA_CACHE_PURGED', 'Purged and regenerated all application database caches');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Application data cache has been purged and regenerated successfully.'),
        ]);

        return redirect()->back();
    }

    /**
     * Clear Laravel framework bootstrap caches (config, route, view, event).
     */
    public function clearFrameworkCache(Request $request): RedirectResponse
    {
        // 1. Clear framework bootstrap caches
        try {
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            Artisan::call('event:clear');
        } catch (\Throwable $e) {
            // Silently capture if any permission issues arise on shared hosting
        }

        // 2. Log the activity
        ActivityLogger::log('FRAMEWORK_CACHE_CLEARED', 'Cleared Laravel framework bootstrap caches (config, routes, views, events)');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Laravel framework bootstrap caches cleared successfully.'),
        ]);

        return redirect()->back();
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
