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

        $posts = Post::with(['user', 'categories'])
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
            'excerpt_base64' => 'nullable|string',
            'body' => 'nullable|string',
            'body_base64' => 'nullable|string',
            'main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'published_at' => 'nullable|date',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_time' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'focus_keyword' => 'nullable|string|max:255',
            'secondary_keywords' => 'nullable|array',
            'secondary_keywords.*' => 'string|max:100',
            'no_index' => 'nullable|boolean',
            'categories' => 'nullable|array',
            'faqs' => 'nullable|array',
            'faqs.*.question' => 'nullable|string|max:500',
            'faqs.*.answer' => 'nullable|string',
        ]);

        // Decode Base64-transported markdown body and excerpt to prevent WAF false-positives
        if ($request->filled('body_base64')) {
            $decodedBody = base64_decode($request->input('body_base64'), true);
            if ($decodedBody !== false) {
                $validated['body'] = $decodedBody;
            }
        }
        if ($request->filled('excerpt_base64')) {
            $decodedExcerpt = base64_decode($request->input('excerpt_base64'), true);
            if ($decodedExcerpt !== false) {
                $validated['excerpt'] = $decodedExcerpt;
            }
        }

        // Handle main image upload
        $imagePath = null;
        if ($request->hasFile('main_image')) {
            $imagePath = $imageService->upload($request->file('main_image'));
        }

        // Clean FAQs of empty entries
        $cleanFaqs = collect($validated['faqs'] ?? [])
            ->filter(fn ($faq) => is_array($faq) && (filled(trim($faq['question'] ?? '')) || filled(trim($faq['answer'] ?? ''))))
            ->values()
            ->all();

        // Clean categories list
        $cleanCategories = collect($validated['categories'] ?? [])
            ->filter(fn ($item) => is_string($item) ? filled(trim($item)) : !empty($item))
            ->map(fn ($item) => is_array($item) ? ($item['title'] ?? $item['name'] ?? null) : $item)
            ->filter()
            ->values()
            ->all();

        $userId = $request->user()?->id ?? auth()->id();

        $post = Post::create([
            'title' => $validated['title'],
            'slug' => $validated['slug'] ?? Str::slug($validated['title']),
            'excerpt' => $validated['excerpt'] ?? null,
            'body' => $validated['body'] ?? null,
            'main_image' => $imagePath,
            'published_at' => $validated['published_at'] ?? null,
            'difficulty' => $validated['difficulty'],
            'estimated_time' => $validated['estimated_time'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'focus_keyword' => $validated['focus_keyword'] ?? null,
            'secondary_keywords' => $validated['secondary_keywords'] ?? null,
            'no_index' => (bool) ($validated['no_index'] ?? false),
            'user_id' => $userId,
            'faqs' => $cleanFaqs,
            'categories' => $cleanCategories,
        ]);

        $this->syncCategories($post, $cleanCategories);

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.created', [
            'post_id' => $post->id,
            'slug' => $post->slug,
        ]);

        defer(fn () => ActivityLogger::log('POST_CREATED', "Created blog post '{$post->title}'"));

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
            'excerpt_base64' => 'nullable|string',
            'body' => 'nullable|string',
            'body_base64' => 'nullable|string',
            'main_image' => $request->hasFile('main_image') ? 'image|mimes:jpeg,png,jpg,gif,webp|max:5120' : 'nullable',
            'published_at' => 'nullable|date',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_time' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'focus_keyword' => 'nullable|string|max:255',
            'secondary_keywords' => 'nullable|array',
            'secondary_keywords.*' => 'string|max:100',
            'no_index' => 'nullable|boolean',
            'categories' => 'nullable|array',
            'faqs' => 'nullable|array',
            'faqs.*.question' => 'nullable|string|max:500',
            'faqs.*.answer' => 'nullable|string',
        ]);

        // Decode Base64-transported markdown body and excerpt to prevent WAF false-positives
        if ($request->filled('body_base64')) {
            $decodedBody = base64_decode($request->input('body_base64'), true);
            if ($decodedBody !== false) {
                $validated['body'] = $decodedBody;
            }
        }
        if ($request->filled('excerpt_base64')) {
            $decodedExcerpt = base64_decode($request->input('excerpt_base64'), true);
            if ($decodedExcerpt !== false) {
                $validated['excerpt'] = $decodedExcerpt;
            }
        }

        // Save a revision before updating safely
        try {
            $userId = $request->user()?->id ?? auth()->id();
            if ($userId) {
                $post->revisions()->create([
                    'user_id' => $userId,
                    'title' => $post->title,
                    'excerpt' => $post->excerpt,
                    'body' => $post->body,
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed saving post revision: '.$e->getMessage());
        }

        // Handle main image upload
        $imagePath = $post->main_image;
        if ($request->hasFile('main_image')) {
            // Delete old public image if exists
            if ($post->main_image && str_starts_with($post->main_image, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $post->main_image));
            }
            $imagePath = $imageService->upload($request->file('main_image'));
        }

        // Clean FAQs of empty entries
        $cleanFaqs = collect($validated['faqs'] ?? [])
            ->filter(fn ($faq) => is_array($faq) && (filled(trim($faq['question'] ?? '')) || filled(trim($faq['answer'] ?? ''))))
            ->values()
            ->all();

        // Clean categories list
        $cleanCategories = collect($validated['categories'] ?? [])
            ->filter(fn ($item) => is_string($item) ? filled(trim($item)) : !empty($item))
            ->map(fn ($item) => is_array($item) ? ($item['title'] ?? $item['name'] ?? null) : $item)
            ->filter()
            ->values()
            ->all();

        $post->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'excerpt' => $validated['excerpt'] ?? null,
            'body' => $validated['body'] ?? null,
            'main_image' => $imagePath,
            'published_at' => $validated['published_at'] ?? null,
            'difficulty' => $validated['difficulty'],
            'estimated_time' => $validated['estimated_time'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'focus_keyword' => $validated['focus_keyword'] ?? null,
            'secondary_keywords' => $validated['secondary_keywords'] ?? null,
            'no_index' => (bool) ($validated['no_index'] ?? false),
            'faqs' => $cleanFaqs,
            'categories' => $cleanCategories,
        ]);

        $this->syncCategories($post, $cleanCategories);

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.updated', [
            'post_id' => $post->id,
            'slug' => $post->slug,
        ]);

        defer(fn () => ActivityLogger::log('POST_UPDATED', "Updated blog post '{$post->title}'"));

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

        defer(fn () => ActivityLogger::log('POST_DELETED', "Deleted blog post '{$postTitle}'"));

        return redirect()->route('admin.posts.index')->with('success', 'Post deleted successfully!');
    }

    /**
     * Sync categories to the category_post pivot table.
     *
     * @param  array<string>|null  $categoriesInput
     */
    protected function syncCategories(Post $post, ?array $categoriesInput): void
    {
        if (is_array($categoriesInput) && !empty($categoriesInput)) {
            $categoryIds = collect($categoriesInput)
                ->map(function ($item) {
                    if (is_array($item)) {
                        $name = $item['title'] ?? $item['name'] ?? '';
                    } elseif (is_numeric($item)) {
                        $cat = Category::find($item);
                        return $cat?->id;
                    } else {
                        $name = (string) $item;
                    }

                    $name = trim($name);
                    if ($name === '') {
                        return null;
                    }

                    $slug = Str::slug($name);
                    if ($slug === '') {
                        $slug = 'category-'.Str::random(6);
                    }

                    return Category::firstOrCreate(
                        ['title' => $name],
                        ['slug' => $slug]
                    )->id;
                })
                ->filter()
                ->unique()
                ->values();

            $post->categories()->sync($categoryIds);
        } else {
            $post->categories()->detach();
        }
    }
}
