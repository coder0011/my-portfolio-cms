<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, int $postId)
    {
        // Verify post exists and is published
        $post = Post::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->findOrFail($postId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'comment' => 'required|string|max:2000',
            'user_id' => 'required|string|max:255', // LocalStorage UUID
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'post_id' => $post->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => $validated['name'],
            'comment' => $validated['comment'],
            'user_id' => $validated['user_id'],
            'approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment submitted and is pending moderation.',
            'comment' => $comment,
        ], 201);
    }
}
