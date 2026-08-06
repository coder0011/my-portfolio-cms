<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Jobs\DispatchWebhookJob;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('comments.approve');

        $query = Comment::with('post');

        if ($request->has('post_id')) {
            $query->where('post_id', $request->post_id);
        }

        $comments = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/comments/index', [
            'comments' => $comments,
            'selectedPostId' => $request->post_id ? (int) $request->post_id : null,
        ]);
    }

    /**
     * Toggle the approved status of a comment.
     */
    public function toggleApprove(Comment $comment): RedirectResponse
    {
        Gate::authorize('comments.approve');

        $comment->update([
            'approved' => ! $comment->approved,
        ]);

        if ($comment->approved) {
            DispatchWebhookJob::dispatch('comment.approved', [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
            ]);
        }

        ActivityLogger::log('COMMENT_APPROVE_TOGGLED', ($comment->approved ? 'Approved' : 'Disapproved')." comment by '{$comment->name}'");

        return redirect()->back()->with('success', 'Comment status updated successfully!');
    }

    /**
     * Delete a comment.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        Gate::authorize('comments.delete');

        $name = $comment->name;
        $comment->delete();

        ActivityLogger::log('COMMENT_DELETED', "Deleted comment by '{$name}'");

        return redirect()->back()->with('success', 'Comment deleted successfully!');
    }

    /**
     * Update the text of a comment.
     */
    public function update(Request $request, Comment $comment): RedirectResponse
    {
        Gate::authorize('comments.approve');

        $validated = $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        $comment->update([
            'comment' => $validated['comment'],
        ]);

        ActivityLogger::log('COMMENT_UPDATED', "Updated comment body of '{$comment->name}'");

        return redirect()->back()->with('success', 'Comment updated successfully!');
    }

    /**
     * Post a reply to a comment from the admin.
     */
    public function reply(Request $request, Comment $comment): RedirectResponse
    {
        Gate::authorize('comments.approve');

        $validated = $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        Comment::create([
            'post_id' => $comment->post_id,
            'parent_id' => $comment->id,
            'name' => $request->user()->name,
            'comment' => $validated['comment'],
            'user_id' => null, // Admin user
            'approved' => true, // Auto-approved
        ]);

        ActivityLogger::log('COMMENT_REPLIED', "Replied to comment by '{$comment->name}'");

        return redirect()->back()->with('success', 'Reply posted successfully!');
    }
}
