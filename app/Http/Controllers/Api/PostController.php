<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

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

        // Register the cache key dynamically for targeted cache clearing
        $keys = Cache::get('post_cache_keys', []);
        if (is_array($keys) && ! in_array($cacheKey, $keys, true)) {
            $keys[] = $cacheKey;
            Cache::put('post_cache_keys', $keys, 3600 * 24);
        }

        $posts = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Post::with(['user'])
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->where('no_index', false)
                ->orderBy('published_at', 'desc');

            // Optimized relational category filter using pivot table joins
            if ($request->has('category')) {
                $categorySlug = $request->category;
                $query->whereHas('categories', function ($q) use ($categorySlug) {
                    $q->where('slug', $categorySlug)
                        ->orWhere('title', 'like', '%'.str_replace('-', ' ', $categorySlug).'%');
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

        $posts = Cache::rememberForever('blog_posts_slider', function () use ($limit) {
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
        $post = Cache::rememberForever("blog_post_{$slug}", function () use ($slug) {
            return Post::with([
                'user:id,name,avatar,bio',
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
     * Display the specified unpublished post preview.
     */
    public function preview(string $slug): JsonResponse
    {
        $post = Post::with([
            'user:id,name,avatar,bio',
            'comments' => function ($query) {
                $query->where('approved', true)->orderBy('created_at', 'desc');
            },
        ])
            ->where('slug', $slug)
            ->firstOrFail()
            ->toArray();

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

    /**
     * Display a list of published posts and projects for sitemap generation.
     */
    public function sitemap(): JsonResponse
    {
        $posts = Post::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where('no_index', false)
            ->orderBy('published_at', 'desc')
            ->get(['slug', 'updated_at', 'published_at']);

        $projects = Project::orderBy('sort_order', 'asc')
            ->get(['project_folder', 'updated_at', 'created_at']);

        return response()->json([
            'success' => true,
            'posts' => $posts,
            'projects' => $projects,
        ]);
    }

    /**
     * Display the RSS feed.
     */
    public function rss(): Response
    {
        $posts = Post::with(['user'])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->orderBy('published_at', 'desc')
            ->limit(20)
            ->get();

        return response()->view('rss', compact('posts'))
            ->header('Content-Type', 'text/xml');
    }
}
