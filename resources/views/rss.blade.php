<?= '<?xml version="1.0" encoding="UTF-8" ?>' ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>{{ \App\Models\Setting::get('site_name', 'My Portfolio') }} Blog</title>
    <link>{{ env('FRONTEND_URL', 'http://localhost:3000') }}</link>
    <description>{{ \App\Models\Setting::get('site_meta_description', 'Latest blog posts and developer notes') }}</description>
    <language>en-us</language>
    <lastBuildDate>{{ now()->toRssString() }}</lastBuildDate>
    <atom:link href="{{ url()->current() }}" rel="self" type="application/rss+xml" />
    @foreach($posts as $post)
        <item>
            <title><![CDATA[{{ $post->title }}]]></title>
            <link>{{ env('FRONTEND_URL', 'http://localhost:3000') }}/blogs/{{ $post->slug }}</link>
            <description><![CDATA[{{ $post->excerpt }}]]></description>
            <pubDate>{{ $post->published_at ? $post->published_at->toRssString() : $post->created_at->toRssString() }}</pubDate>
            <guid isPermaLink="true">{{ env('FRONTEND_URL', 'http://localhost:3000') }}/blogs/{{ $post->slug }}</guid>
            @if($post->user)
                <author>{{ $post->user->email }} ({{ $post->user->name }})</author>
            @endif
        </item>
    @endforeach
</channel>
</rss>
