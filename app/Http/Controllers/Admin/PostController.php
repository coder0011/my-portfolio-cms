<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Jobs\DispatchWebhookJob;
use App\Models\Category;
use App\Models\Post;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index(): Response
    {
        Gate::authorize('posts.create'); // Editors can view posts list

        $posts = Post::with(['user'])
            ->withCount('comments')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('posts.create');

        return Inertia::render('admin/posts/create');
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request, ImageService $imageService): RedirectResponse
    {
        Gate::authorize('posts.create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:posts,slug|max:255',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'main_image' => 'nullable|image|max:2048', // Max 2MB image
            'published_at' => 'nullable|date',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_time' => 'nullable|string',
            'tags' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'focus_keyword' => 'nullable|string|max:255',
            'secondary_keywords' => 'nullable|array',
            'no_index' => 'boolean',
            'categories' => 'nullable|array',
            'faqs' => 'nullable|array',
        ]);

        // Handle main image upload
        $imagePath = null;
        if ($request->hasFile('main_image')) {
            $imagePath = $imageService->upload($request->file('main_image'));
        }

        $post = Post::create([
            'title' => $validated['title'],
            'slug' => $validated['slug'] ?? Str::slug($validated['title']),
            'excerpt' => $validated['excerpt'],
            'body' => $validated['body'],
            'main_image' => $imagePath,
            'published_at' => $validated['published_at'],
            'difficulty' => $validated['difficulty'],
            'estimated_time' => $validated['estimated_time'],
            'tags' => $validated['tags'],
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
            'focus_keyword' => $validated['focus_keyword'],
            'secondary_keywords' => $validated['secondary_keywords'],
            'no_index' => $validated['no_index'] ?? false,
            'user_id' => $request->user()->id,
            'faqs' => $validated['faqs'] ?? null,
            'categories' => $validated['categories'] ?? null,
        ]);

        $this->syncCategories($post, $validated['categories'] ?? null);

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.created', [
            'post_id' => $post->id,
            'slug' => $post->slug,
        ]);

        ActivityLogger::log('POST_CREATED', "Created blog post '{$post->title}'");

        return redirect()->route('admin.posts.index')->with('success', 'Post created successfully!');
    }

    /**
     * Show the form for editing the specified post.
     */
    public function edit(Post $post): Response
    {
        Gate::authorize('posts.edit');

        return Inertia::render('admin/posts/edit', [
            'post' => $post,
        ]);
    }

    /**
     * Generate a secure temporary signed URL for a post draft preview.
     */
    public function generatePreviewUrl(Post $post): JsonResponse
    {
        $signedApiUrl = URL::temporarySignedRoute(
            'api.posts.preview',
            now()->addHours(2),
            ['slug' => $post->slug]
        );

        $frontendBaseUrl = (string) config('app.frontend_url', 'http://localhost:3000');

        $parsedUrl = parse_url($signedApiUrl);
        $queryString = $parsedUrl['query'] ?? '';

        $frontendPreviewUrl = rtrim($frontendBaseUrl, '/').'/blogs/preview?slug='.$post->slug.'&'.$queryString;

        return response()->json([
            'success' => true,
            'preview_url' => $frontendPreviewUrl,
        ]);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(Request $request, Post $post, ImageService $imageService): RedirectResponse
    {
        Gate::authorize('posts.edit');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts,slug,'.$post->id,
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'main_image' => 'nullable', // Can be file or existing URL string
            'published_at' => 'nullable|date',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_time' => 'nullable|string',
            'tags' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'focus_keyword' => 'nullable|string|max:255',
            'secondary_keywords' => 'nullable|array',
            'no_index' => 'boolean',
            'categories' => 'nullable|array',
            'faqs' => 'nullable|array',
        ]);

        // Save a revision before updating
        $post->revisions()->create([
            'user_id' => $request->user()->id,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'body' => $post->body,
        ]);

        // Handle main image upload
        $imagePath = $post->main_image;
        if ($request->hasFile('main_image')) {
            // Delete old public image if exists
            if ($post->main_image && str_starts_with($post->main_image, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $post->main_image));
            }
            $imagePath = $imageService->upload($request->file('main_image'));
        }

        $post->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'excerpt' => $validated['excerpt'],
            'body' => $validated['body'],
            'main_image' => $imagePath,
            'published_at' => $validated['published_at'],
            'difficulty' => $validated['difficulty'],
            'estimated_time' => $validated['estimated_time'],
            'tags' => $validated['tags'],
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
            'focus_keyword' => $validated['focus_keyword'],
            'secondary_keywords' => $validated['secondary_keywords'],
            'no_index' => $validated['no_index'] ?? false,
            'faqs' => $validated['faqs'] ?? null,
            'categories' => $validated['categories'] ?? null,
        ]);

        $this->syncCategories($post, $validated['categories'] ?? null);

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.updated', [
            'post_id' => $post->id,
            'slug' => $post->slug,
        ]);

        ActivityLogger::log('POST_UPDATED', "Updated blog post '{$post->title}'");

        return redirect()->route('admin.posts.index')->with('success', 'Post updated successfully!');
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        Gate::authorize('posts.delete');

        if ($post->main_image && str_starts_with($post->main_image, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $post->main_image));
        }

        $slug = $post->slug; // Save slug for payload
        $postTitle = $post->title;
        $post->delete();

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.deleted', [
            'slug' => $slug,
        ]);

        ActivityLogger::log('POST_DELETED', "Deleted blog post '{$postTitle}'");

        return redirect()->route('admin.posts.index')->with('success', 'Post deleted successfully!');
    }

    /**
     * Sync categories to the category_post pivot table.
     *
     * @param  array<string>|null  $categoriesInput
     */
    protected function syncCategories(Post $post, ?array $categoriesInput): void
    {
        if (is_array($categoriesInput)) {
            $categoryIds = collect($categoriesInput)->map(function ($name) {
                $name = trim($name);

                return Category::firstOrCreate(
                    ['title' => $name],
                    ['slug' => Str::slug($name)]
                )->id;
            });
            $post->categories()->sync($categoryIds);
        } else {
            $post->categories()->detach();
        }
    }
}
