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
        $category = $request->get('category', 'all');
        $tag = $request->get('tag', 'all');
        $page = $request->get('page', 1);
        $limit = $request->get('limit', 10);
        $cacheKey = "blog_posts_{$category}_{$tag}_page_{$page}_limit_{$limit}";

        $posts = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($request) {
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

            return $query->paginate($request->get('limit', 10))->toArray();
        });

        return response()->json($posts);
    }

    /**
     * Display a lightweight listing of published posts for slider display.
     */
    public function slider(Request $request): JsonResponse
    {
        $limit = min(15, max(1, (int) $request->get('limit', 6)));

        $posts = \Illuminate\Support\Facades\Cache::rememberForever('blog_posts_slider', function () use ($limit) {
            return Post::select([
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
                ->get()
                ->toArray();
        });

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
        $post = \Illuminate\Support\Facades\Cache::rememberForever("blog_post_{$slug}", function () use ($slug) {
            return Post::with([
                'user:id,name,avatar,bio',
                'categories:id,title,slug',
                'comments' => function ($query) {
                    $query->where('approved', true)->orderBy('created_at', 'desc');
                },
            ])
                ->where('slug', $slug)
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->firstOrFail()
                ->toArray();
        });

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
