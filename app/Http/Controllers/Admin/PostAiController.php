<?php

namespace App\Http\Controllers\Admin;

use App\Ai\Agents\EditorialAgent;
use App\Ai\Agents\PostSeoAgent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Throwable;

class PostAiController extends Controller
{
    /**
     * Generate structured SEO metadata and FAQs from post content.
     */
    public function generateSeo(Request $request): JsonResponse
    {
        Gate::authorize('posts.create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'excerpt' => 'nullable|string',
        ]);

        try {
            $prompt = sprintf(
                "Article Title: %s\n\nArticle Excerpt: %s\n\nArticle Content:\n%s",
                $validated['title'],
                $validated['excerpt'] ?? '',
                $validated['body'] ?? 'No body content provided yet.'
            );

            $response = (new PostSeoAgent)->prompt($prompt);

            return response()->json([
                'success' => true,
                'data' => $response->structured,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate SEO metadata: '.$e->getMessage(),
            ], 422);
        }
    }

    /**
     * Assist with editorial writing (outlines, improving, or simplifying).
     */
    public function assistEditorial(Request $request): JsonResponse
    {
        Gate::authorize('posts.create');

        $validated = $request->validate([
            'action' => 'required|string|in:outline,improve,simplify',
            'content' => 'nullable|string',
            'title' => 'nullable|string',
        ]);

        try {
            $prompt = match ($validated['action']) {
                'outline' => sprintf(
                    "Generate a detailed, publication-ready Markdown outline for an article titled '%s'. Include key subheadings (H2, H3) and bullet points summarizing each section.",
                    $validated['title'] ?? 'Technical Guide'
                ),
                'improve' => sprintf(
                    "Improve the following Markdown content. Polish the writing for clarity, flow, and impact while preserving code blocks and technical terminology:\n\n%s",
                    $validated['content'] ?? ''
                ),
                'simplify' => sprintf(
                    "Apply Ponytail radical minimalism to the following Markdown content. Cut all unnecessary fluff, boilerplate, and wordy explanations. Make it direct and punchy:\n\n%s",
                    $validated['content'] ?? ''
                ),
            };

            $response = (new EditorialAgent)->prompt($prompt);

            return response()->json([
                'success' => true,
                'content' => (string) $response,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Editorial assistant failed: '.$e->getMessage(),
            ], 422);
        }
    }
}
