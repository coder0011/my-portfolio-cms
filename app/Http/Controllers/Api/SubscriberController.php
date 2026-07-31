<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    /**
     * Store a newly created subscriber in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:subscribers,email',
        ]);

        $subscriber = Subscriber::create([
            'email' => $validated['email'],
            'subscribed_at' => now(),
        ]);

        // In a real application, you'd dispatch a mail verification notification here
        
        return response()->json([
            'success' => true,
            'message' => 'Successfully subscribed to the newsletter!',
            'subscriber' => $subscriber,
        ], 201);
    }
}
