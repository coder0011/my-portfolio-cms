<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'asset_url' => asset(''),
            'siteSettings' => [
                'site_name' => Setting::get('site_name', config('app.name')),
                'site_logo' => Setting::get('site_logo'),
                'site_favicon' => Setting::get('site_favicon'),
                'admin_logo' => Setting::get('admin_logo'),
                'admin_icon' => Setting::get('admin_icon'),
            ],
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
