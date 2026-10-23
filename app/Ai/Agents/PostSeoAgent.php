<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

class PostSeoAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
You are a senior SEO Strategist and technical content marketer.
Your role is to analyze a blog article's title, excerpt, and body content and generate high-impact, search-optimized metadata and FAQ schema.

Guidelines:
1. meta_title: Under 60 characters, compelling for search CTR, includes primary keyword.
2. meta_description: 140-160 characters, matches user search intent.
3. focus_keyword: The single most targeted search keyword for this article.
4. secondary_keywords: 3 to 5 related, high-intent LSI/long-tail search phrases.
5. suggested_excerpt: A concise 2-sentence summary hook.
6. faqs: 2 to 4 FAQs with concise, direct answers suitable for rich snippets and Answer Engine Optimization (AEO).
7. tags: 3 to 6 relevant taxonomy tags.
INSTRUCTIONS;
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'meta_title' => $schema->string()->required(),
            'meta_description' => $schema->string()->required(),
            'focus_keyword' => $schema->string()->required(),
            'secondary_keywords' => $schema->array()->items($schema->string())->required(),
            'suggested_excerpt' => $schema->string()->required(),
            'faqs' => $schema->array()->items(
                $schema->object([
                    'question' => $schema->string()->required(),
                    'answer' => $schema->string()->required(),
                ])
            )->required(),
            'tags' => $schema->array()->items($schema->string())->required(),
        ];
    }
}
