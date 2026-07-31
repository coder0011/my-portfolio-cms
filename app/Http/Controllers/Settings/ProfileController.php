<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Models\Setting;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'siteSettings' => [
                'site_name' => Setting::get('site_name', config('app.name')),
                'site_logo' => Setting::get('site_logo'),
                'site_favicon' => Setting::get('site_favicon'),
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

            // Site Settings
            'site_name' => 'nullable|string|max:255',
            'site_logo' => 'nullable|image|max:2048',
            'site_favicon' => 'nullable|image|max:1024',
            'admin_logo' => 'nullable|image|max:2048',
            'admin_icon' => 'nullable|image|max:1024',
        ]);

        // Update profile
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->bio = $validated['bio'] ?? null;

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_starts_with($user->avatar, '/storage')) {
                Storage::delete(str_replace('/storage', 'public', $user->avatar));
            }
            $path = $request->file('avatar')->store('public/blogs/avatars');
            if ($path !== false) {
                $user->avatar = Storage::url($path);
            }
        }

        $user->save();

        // Update site settings
        if ($request->has('site_name')) {
            Setting::set('site_name', $validated['site_name']);
        }

        $settingFiles = ['site_logo', 'site_favicon', 'admin_logo', 'admin_icon'];
        foreach ($settingFiles as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $oldValue = Setting::get($fileKey);
                if ($oldValue && str_starts_with($oldValue, '/storage')) {
                    Storage::delete(str_replace('/storage', 'public', $oldValue));
                }

                $path = $request->file($fileKey)->store('public/blogs/settings');
                if ($path !== false) {
                    Setting::set($fileKey, Storage::url($path));
                }
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile and settings updated.')]);

        return to_route('profile.edit');
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
