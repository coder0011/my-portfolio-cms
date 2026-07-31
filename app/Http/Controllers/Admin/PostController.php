<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DispatchWebhookJob;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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

    /**
     * Show the form for creating a new post.
     */
    public function create(): Response
    {
        Gate::authorize('posts.create');

        $categories = Category::all();

        return Inertia::render('admin/posts/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request): RedirectResponse
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
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        // Handle main image upload
        $imagePath = null;
        if ($request->hasFile('main_image')) {
            $path = $request->file('main_image')->store('public/blogs/images');
            if ($path !== false) {
                $imagePath = Storage::url($path);
            }
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
        ]);

        if (! empty($validated['category_ids'])) {
            $post->categories()->sync($validated['category_ids']);
        }

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.created', [
            'post_id' => $post->id,
            'slug' => $post->slug,
        ]);

        return redirect()->route('admin.posts.index')->with('success', 'Post created successfully!');
    }

    /**
     * Show the form for editing the specified post.
     */
    public function edit(Post $post): Response
    {
        Gate::authorize('posts.edit');

        $categories = Category::all();
        $post->load('categories');

        return Inertia::render('admin/posts/edit', [
            'post' => $post,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(Request $request, Post $post): RedirectResponse
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
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
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
            // Delete old local image if exists
            if ($post->main_image && str_starts_with($post->main_image, '/storage/blogs/images')) {
                Storage::delete(str_replace('/storage', 'public', $post->main_image));
            }
            $path = $request->file('main_image')->store('public/blogs/images');
            if ($path !== false) {
                $imagePath = Storage::url($path);
            }
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
        ]);

        $post->categories()->sync($validated['category_ids'] ?? []);

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.updated', [
            'post_id' => $post->id,
            'slug' => $post->slug,
        ]);

        return redirect()->route('admin.posts.index')->with('success', 'Post updated successfully!');
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        Gate::authorize('posts.delete');

        if ($post->main_image && str_starts_with($post->main_image, '/storage/blogs/images')) {
            Storage::delete(str_replace('/storage', 'public', $post->main_image));
        }

        $slug = $post->slug; // Save slug for payload
        $post->delete();

        // Dispatch frontend rebuild webhook
        DispatchWebhookJob::dispatch('post.deleted', [
            'slug' => $slug,
        ]);

        return redirect()->route('admin.posts.index')->with('success', 'Post deleted successfully!');
    }
}
