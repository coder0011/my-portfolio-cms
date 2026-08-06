<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Contact;

class ContactController extends Controller
{
    /**
     * Store and handle a contact message.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'g-recaptcha-response' => 'required|string',
        ]);

        // 1. Verify Google reCAPTCHA
        $recaptchaSecret = env('RECAPTCHA_SECRET', '6LcNg6orAAAAADYfj_wWTsLxUslRxmLYpzOtE_0g');
        
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $recaptchaSecret,
            'response' => $validated['g-recaptcha-response'],
            'remoteip' => $request->ip(),
        ]);

        $verification = $response->json();
        $captchaSuccess = $verification['success'] ?? false;

        // In production, enforce captcha validation score/success
        if (!$captchaSuccess && app()->environment('production')) {
            return response()->json([
                'success' => false,
                'message' => 'ReCAPTCHA verification failed. Please try again.',
                'errors' => [
                    'captcha' => ['ReCAPTCHA verification failed.']
                ]
            ], 422);
        }

        // 2. Save Contact Message to DB
        Contact::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        // 3. Dispatch Contact Email
        try {
            Mail::raw(
                "New Contact Message Received:\n\n" .
                "Name: {$validated['name']}\n" .
                "Email: {$validated['email']}\n" .
                "Subject: {$validated['subject']}\n\n" .
                "Message:\n{$validated['message']}",
                function ($message) use ($validated) {
                    $toAddresses = array_filter(array_map('trim', explode(',', env('MAIL_TO_ADDRESS', 'saurabh.ss668@gmail.com'))));
                    
                    $message->subject("Someone tried to contact: " . $validated['subject'])
                        ->replyTo($validated['email'], $validated['name']);
                        
                    foreach ($toAddresses as $addr) {
                        if (filter_var($addr, FILTER_VALIDATE_EMAIL)) {
                            $message->to($addr);
                        }
                    }
                }
            );
        } catch (\Exception $e) {
            Log::error("Failed to send contact email in CMS: " . $e->getMessage());
            // In local development, don't fail the response if the mail client config is missing (e.g. if mailer=log writes to file)
            if (app()->environment('production')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send message. Mail configuration error.',
                ], 500);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for reaching out to me, I\'ll get back to you soon.',
        ], 200);
    }
}
