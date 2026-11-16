<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsIndexingTest extends TestCase
{
    use RefreshDatabase;

    public function test_cms_defaults_to_noindex_meta_tag_and_header(): void
    {
        config(['app.cms_indexing' => false]);

        $response = $this->get(route('login'));

        $response->assertOk();
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        $response->assertSee('<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">', false);
    }

    public function test_cms_dynamic_robots_txt_disallows_all_when_indexing_disabled(): void
    {
        config(['app.cms_indexing' => false]);

        $response = $this->get('/robots.txt');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $this->assertStringContainsString("User-agent: *\nDisallow: /", $response->getContent());
    }

    public function test_cms_emits_index_directives_when_cms_indexing_is_enabled(): void
    {
        config(['app.cms_indexing' => true]);

        $response = $this->get(route('login'));

        $response->assertOk();
        $this->assertFalse($response->headers->has('X-Robots-Tag'));
        $response->assertSee('<meta name="robots" content="index, follow">', false);
    }

    public function test_cms_robots_txt_allows_root_when_cms_indexing_is_enabled(): void
    {
        config(['app.cms_indexing' => true]);

        $response = $this->get('/robots.txt');

        $response->assertOk();
        $this->assertStringContainsString("Allow: /", $response->getContent());
        $this->assertStringContainsString("Disallow: /dashboard/", $response->getContent());
    }
}
