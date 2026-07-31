<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;

class MigrateSanityCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:sanity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $signature_description = 'Migrate portfolio data from Sanity CMS to local MySQL';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Sanity CMS migration...');

        // 1. Fetch data from Sanity CDN
        $projectId = 'mip7w4pq';
        $dataset = 'production';
        $query = '*[_type in ["post", "author", "category", "comment"]]';
        $url = "https://{$projectId}.api.sanity.io/v2021-10-21/data/query/{$dataset}?query=" . urlencode($query);

        $this->info("Fetching data from: {$url}");
        $response = Http::withoutVerifying()->get($url);

        if ($response->failed()) {
            $this->error('Failed to fetch data from Sanity API.');
            return 1;
        }

        $data = $response->json();
        $documents = $data['result'] ?? [];
        $this->info('Found ' . count($documents) . ' documents from Sanity.');

        // Group documents by type
        $grouped = collect($documents)->groupBy('_type');

        // Maps to connect relationships
        $categoryMap = []; // [sanity_id => category_model]
        $authorMap = [];   // [sanity_id => user_model]
        $postMap = [];     // [sanity_id => post_model]

        // Ensure directories exist
        Storage::makeDirectory('public/blogs/images');
        Storage::makeDirectory('public/blogs/avatars');

        // 2. Migrate Categories
        $this->info('Migrating categories...');
        $categories = $grouped->get('category', collect());
        foreach ($categories as $catDoc) {
            $slug = $catDoc['slug']['current'] ?? Str::slug($catDoc['title']);
            $category = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $catDoc['title'],
                    'description' => $catDoc['description'] ?? null,
                ]
            );
            $categoryMap[$catDoc['_id']] = $category;
        }
        $this->info("Migrated " . count($categoryMap) . " categories.");

        // 3. Migrate Authors -> Users
        $this->info('Migrating authors...');
        $authors = $grouped->get('author', collect());
        foreach ($authors as $authorDoc) {
            $email = Str::slug($authorDoc['name']) . '@portfolio.com'; // Fallback email
            
            // Check if user already exists
            $user = User::where('email', $email)->first();
            
            // Handle avatar
            $avatarUrl = null;
            if (isset($authorDoc['image']['asset']['_ref'])) {
                $avatarUrl = $this->downloadSanityImage($authorDoc['image']['asset']['_ref'], 'avatars');
            }

            // Convert bio Portable Text to plain text / markdown
            $bio = null;
            if (isset($authorDoc['bio']) && is_array($authorDoc['bio'])) {
                $bio = $this->portableTextToMarkdown($authorDoc['bio']);
            }

            if (!$user) {
                $user = User::create([
                    'name' => $authorDoc['name'],
                    'email' => $email,
                    'password' => bcrypt(Str::random(16)), // Random secure password
                    'avatar' => $avatarUrl,
                    'bio' => $bio,
                ]);
                $user->assignRole('Editor'); // Assign editor role
            } else {
                $user->update([
                    'avatar' => $avatarUrl ?? $user->avatar,
                    'bio' => $bio ?? $user->bio,
                ]);
            }

            $authorMap[$authorDoc['_id']] = $user;
        }
        $this->info("Migrated " . count($authorMap) . " authors.");

        // 4. Migrate Posts
        $this->info('Migrating posts...');
        $posts = $grouped->get('post', collect());
        foreach ($posts as $postDoc) {
            $slug = $postDoc['slug']['current'] ?? Str::slug($postDoc['title']);
            
            // Find author
            $authorRef = $postDoc['author']['_ref'] ?? null;
            $user = $authorMap[$authorRef] ?? User::first(); // Default to first user if none found

            // Handle main image
            $mainImage = null;
            if (isset($postDoc['mainImage']['asset']['_ref'])) {
                $mainImage = $this->downloadSanityImage($postDoc['mainImage']['asset']['_ref'], 'images');
            }

            // Parse body Portable Text
            $body = null;
            if (isset($postDoc['body']) && is_array($postDoc['body'])) {
                $body = $this->portableTextToMarkdown($postDoc['body']);
            }

            // SEO Metadata fields
            $metaTitle = $postDoc['seo']['metaTitle'] ?? null;
            $metaDescription = $postDoc['seo']['metaDescription'] ?? null;
            $focusKeyword = $postDoc['seo']['focusKeyword'] ?? null;
            $secondaryKeywords = $postDoc['seo']['secondaryKeywords'] ?? null;
            $noIndex = $postDoc['seo']['noIndex'] ?? false;

            $post = Post::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $postDoc['title'],
                    'excerpt' => $postDoc['excerpt'] ?? null,
                    'body' => $body,
                    'main_image' => $mainImage,
                    'published_at' => isset($postDoc['publishedAt']) ? \Illuminate\Support\Carbon::parse($postDoc['publishedAt']) : null,
                    'likes_count' => $postDoc['likes'] ?? 0,
                    'difficulty' => $postDoc['difficulty'] ?? 'beginner',
                    'estimated_time' => $postDoc['estimatedTime'] ?? null,
                    'tags' => $postDoc['tags'] ?? null,
                    'meta_title' => $metaTitle,
                    'meta_description' => $metaDescription,
                    'focus_keyword' => $focusKeyword,
                    'secondary_keywords' => $secondaryKeywords,
                    'no_index' => $noIndex,
                    'user_id' => $user->id,
                ]
            );

            // Attach categories
            $categoriesRef = $postDoc['categories'] ?? [];
            $categoryIds = [];
            foreach ($categoriesRef as $ref) {
                if (isset($categoryMap[$ref['_ref']])) {
                    $categoryIds[] = $categoryMap[$ref['_ref']]->id;
                }
            }
            $post->categories()->sync($categoryIds);

            $postMap[$postDoc['_id']] = $post;
        }
        $this->info("Migrated " . count($postMap) . " posts.");

        // 5. Migrate Comments
        $this->info('Migrating comments...');
        $comments = $grouped->get('comment', collect());
        $commentsMigrated = 0;
        foreach ($comments as $commentDoc) {
            $postRef = $commentDoc['post']['_ref'] ?? null;
            if (!$postRef || !isset($postMap[$postRef])) {
                continue;
            }

            Comment::updateOrCreate(
                [
                    'post_id' => $postMap[$postRef]->id,
                    'name' => $commentDoc['name'] ?? 'Anonymous',
                    'comment' => $commentDoc['comment'] ?? '',
                    'user_id' => $commentDoc['userId'] ?? null,
                ],
                [
                    'approved' => $commentDoc['approved'] ?? false,
                ]
            );
            $commentsMigrated++;
        }
        $this->info("Migrated {$commentsMigrated} comments.");

        $this->info('Sanity CMS migration completed successfully!');
        return 0;
    }

    /**
     * Download Sanity image from reference and save to storage.
     */
    private function downloadSanityImage(string $ref, string $subDir): ?string
    {
        // Sanity image ref structure: image-8d00...-300x200-png
        if (!preg_match('/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/', $ref, $matches)) {
            if (!preg_match('/^image-([a-f0-9]+)-(\w+)$/', $ref, $matches)) {
                return null;
            }
            $id = $matches[1];
            $ext = $matches[2];
            $dimensions = '';
        } else {
            $id = $matches[1];
            $dimensions = '-' . $matches[2];
            $ext = $matches[3];
        }

        $filename = "{$id}{$dimensions}.{$ext}";
        $url = "https://cdn.sanity.io/images/mip7w4pq/production/{$filename}";

        try {
            $response = Http::withoutVerifying()->get($url);
            if ($response->successful()) {
                $contents = $response->body();
                $path = "public/blogs/{$subDir}/{$filename}";
                Storage::put($path, $contents);
                return Storage::url($path);
            }
        } catch (\Exception $e) {
            $this->error("Failed to download image: {$url}");
        }

        return null;
    }

    /**
     * Custom lightweight parser from Sanity Portable Text blocks to Markdown.
     */
    private function portableTextToMarkdown(array $blocks): string
    {
        $markdown = '';
        foreach ($blocks as $block) {
            $type = $block['_type'] ?? '';

            if ($type === 'block') {
                $style = $block['style'] ?? 'normal';
                $listItem = $block['listItem'] ?? null;
                $level = $block['level'] ?? 1;

                $text = '';
                foreach ($block['children'] ?? [] as $child) {
                    if (($child['_type'] ?? '') === 'span') {
                        $spanText = $child['text'] ?? '';
                        $marks = $child['marks'] ?? [];

                        if (in_array('strong', $marks)) {
                            $spanText = "**{$spanText}**";
                        }
                        if (in_array('em', $marks)) {
                            $spanText = "*{$spanText}*";
                        }
                        if (in_array('code', $marks)) {
                            $spanText = "`{$spanText}`";
                        }

                        // Link handling
                        foreach ($marks as $mark) {
                            if ($mark !== 'strong' && $mark !== 'em' && $mark !== 'code') {
                                foreach ($block['markDefs'] ?? [] as $def) {
                                    if ($def['_key'] === $mark && ($def['_type'] ?? '') === 'link') {
                                        $href = $def['href'] ?? '#';
                                        $spanText = "[{$spanText}]({$href})";
                                    }
                                }
                            }
                        }

                        $text .= $spanText;
                    }
                }

                if ($listItem === 'bullet') {
                    $indent = str_repeat('  ', $level - 1);
                    $markdown .= "{$indent}* {$text}\n";
                } elseif ($listItem === 'number') {
                    $indent = str_repeat('  ', $level - 1);
                    $markdown .= "{$indent}1. {$text}\n";
                } else {
                    switch ($style) {
                        case 'h1':
                            $markdown .= "# {$text}\n\n";
                            break;
                        case 'h2':
                            $markdown .= "## {$text}\n\n";
                            break;
                        case 'h3':
                            $markdown .= "### {$text}\n\n";
                            break;
                        case 'h4':
                            $markdown .= "#### {$text}\n\n";
                            break;
                        case 'blockquote':
                            $markdown .= "> {$text}\n\n";
                            break;
                        default:
                            if (trim($text) === '') {
                                $markdown .= "\n";
                            } else {
                                $markdown .= "{$text}\n\n";
                            }
                            break;
                    }
                }
            } elseif ($type === 'code') {
                $code = $block['code'] ?? '';
                $language = $block['language'] ?? '';
                $markdown .= "```{$language}\n{$code}\n```\n\n";
            } elseif ($type === 'image') {
                $assetRef = $block['asset']['_ref'] ?? null;
                if ($assetRef) {
                    $url = $this->downloadSanityImage($assetRef, 'images');
                    if ($url) {
                        $markdown .= "![Image]({$url})\n\n";
                    }
                }
            }
        }
        return trim($markdown);
    }
}
