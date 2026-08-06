<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of contact submissions.
     */
    public function index(): Response
    {
        Gate::authorize('contacts.manage');

        $contacts = Contact::orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/contacts/index', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Delete a contact submission.
     */
    public function destroy(Contact $contact): RedirectResponse
    {
        Gate::authorize('contacts.manage');

        $email = $contact->email;
        $subject = $contact->subject;
        $contact->delete();

        ActivityLogger::log('CONTACT_DELETED', "Removed contact message from '{$email}' (Subject: '{$subject}')");

        return redirect()->back()->with('success', 'Contact submission removed successfully!');
    }
}
