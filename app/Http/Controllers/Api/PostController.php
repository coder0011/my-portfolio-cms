<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of published posts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['user', 'categories'])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where('no_index', false)
            ->orderBy('published_at', 'desc');

        // Optional filter by category
        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Optional filter by tag
        if ($request->has('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }

        $posts = $query->paginate($request->get('limit', 10));

        return response()->json($posts);
    }

    /**
     * Display a lightweight listing of published posts for slider display.
     */
    public function slider(Request $request): JsonResponse
    {
        $limit = min(15, max(1, (int) $request->get('limit', 6)));

        $posts = Post::select([
            'id',
            'title',
            'slug',
            'excerpt',
            'main_image',
            'published_at',
            'likes_count',
            'user_id',
        ])
            ->withCount('comments')
            ->with(['user:id,name'])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where('no_index', false)
            ->orderBy('published_at', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'posts' => $posts,
        ]);
    }

    /**
     * Display the specified published post.
     */
    public function show(string $slug): JsonResponse
    {
        $post = Post::with([
            'user:id,name,avatar,bio',
            'categories:id,title,slug',
            'comments' => function ($query) {
                $query->where('approved', true)->orderBy('created_at', 'desc');
            },
        ])
            ->where('slug', $slug)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->firstOrFail();

        return response()->json($post);
    }

    /**
     * Increment the likes count of a post.
     */
    public function like(int $id): JsonResponse
    {
        $post = Post::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->findOrFail($id);

        $post->increment('likes_count');

        return response()->json([
            'success' => true,
            'likes_count' => $post->likes_count,
        ]);
    }
}
