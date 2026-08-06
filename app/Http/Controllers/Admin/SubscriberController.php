<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SubscriberController extends Controller
{
    /**
     * Display a listing of subscribers.
     */
    public function index(): Response
    {
        Gate::authorize('subscribers.manage');

        $subscribers = Subscriber::orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/subscribers/index', [
            'subscribers' => $subscribers,
        ]);
    }

    /**
     * Delete a subscriber.
     */
    public function destroy(Subscriber $subscriber): RedirectResponse
    {
        Gate::authorize('subscribers.manage');

        $email = $subscriber->email;
        $subscriber->delete();

        ActivityLogger::log('SUBSCRIBER_DELETED', "Removed newsletter subscriber '{$email}'");

        return redirect()->back()->with('success', 'Subscriber removed successfully!');
    }
}
