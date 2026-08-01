import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSeoAnalysis } from '@/hooks/use-seo-analysis';
import admin from '@/routes/admin';

interface Category {
    id: number;
    title: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string | null;
    main_image: string | null;
    published_at: string | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimated_time: string | null;
    tags: string[] | null;
    meta_title: string | null;
    meta_description: string | null;
    focus_keyword: string | null;
    secondary_keywords: string[] | null;
    no_index: boolean;
    categories?: Category[];
}

export default function Edit({ post, categories }: { post: Post; categories: Category[] }) {
    const { asset_url } = usePage<any>().props;

    // Format published_at for datetime-local input
    const formatDateTime = (dateTimeStr: string | null) => {
        if (!dateTimeStr) {
return '';
}

        const d = new Date(dateTimeStr);

        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const { data, setData, post: submitForm, processing, errors } = useForm({
        _method: 'PUT', // Force Laravel to parse it as PUT for file upload
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        body: post.body ?? '',
        main_image: null as File | null,
        published_at: formatDateTime(post.published_at),
        difficulty: post.difficulty,
        estimated_time: post.estimated_time ?? '',
        tags: post.tags ?? [],
        meta_title: post.meta_title ?? '',
        meta_description: post.meta_description ?? '',
        focus_keyword: post.focus_keyword ?? '',
        secondary_keywords: post.secondary_keywords ?? [],
        no_index: post.no_index,
        category_ids: post.categories ? post.categories.map(c => c.id) : [],
    });

    const [tagsInput, setTagsInput] = useState((post.tags ?? []).join(', '));
    const [secondaryKeywordsInput, setSecondaryKeywordsInput] = useState((post.secondary_keywords ?? []).join(', '));
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleTagsChange = (val: string) => {
        setTagsInput(val);
        const parsed = val.split(',').map(t => t.trim()).filter(Boolean);
        setData('tags', parsed);
    };

    const handleSecondaryKeywordsChange = (val: string) => {
        setSecondaryKeywordsInput(val);
        const parsed = val.split(',').map(k => k.trim()).filter(Boolean);
        setData('secondary_keywords', parsed);
    };

    const handleCategoryToggle = (id: number) => {
        const current = [...data.category_ids];
        const idx = current.indexOf(id);

        if (idx > -1) {
            current.splice(idx, 1);
        } else {
            current.push(id);
        }

        setData('category_ids', current);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Standard Laravel multipart PUT requires sending as POST with _method = PUT
        submitForm(admin.posts.update({ post: post.id }).url, {
            onSuccess: () => {
                // Done
            }
        });
    };

    // Real-time SEO analysis computed via custom hook
    const seoAnalysis = useSeoAnalysis({
        title: data.title,
        meta_title: data.meta_title,
        excerpt: data.excerpt,
        meta_description: data.meta_description,
        focus_keyword: data.focus_keyword,
        body: data.body,
    });

    return (
        <>
            <Head title={`Edit Post: ${post.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
                {/* Top Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={admin.posts.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
                            <p className="text-muted-foreground text-sm">Modify your existing blog post details.</p>
                        </div>
                    </div>
                </div>

                {/* Main Form + SEO sidebar */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Editor Card */}
                        <div className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm flex flex-col gap-4">
                            <div>
                                <Label htmlFor="title">Post Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. My Awesome Portfolio Journey"
                                    className="mt-1"
                                />
                                {errors.title && <span className="text-destructive text-xs mt-1">{errors.title}</span>}
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug (URL Path)</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={e => setData('slug', e.target.value)}
                                    placeholder="my-awesome-portfolio-journey"
                                    className="mt-1 font-mono text-sm"
                                />
                                {errors.slug && <span className="text-destructive text-xs mt-1">{errors.slug}</span>}
                            </div>

                            <div>
                                <Label htmlFor="excerpt">Excerpt / Summary</Label>
                                <textarea
                                    id="excerpt"
                                    rows={2}
                                    value={data.excerpt}
                                    onChange={e => setData('excerpt', e.target.value)}
                                    placeholder="Write a brief, catchy summary of the post..."
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1"
                                />
                                {errors.excerpt && <span className="text-destructive text-xs mt-1">{errors.excerpt}</span>}
                            </div>

                            <div>
                                <Label htmlFor="body">Markdown Content</Label>
                                <textarea
                                    id="body"
                                    rows={15}
                                    value={data.body}
                                    onChange={e => setData('body', e.target.value)}
                                    placeholder="Write your article body using Markdown..."
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1"
                                />
                                {errors.body && <span className="text-destructive text-xs mt-1">{errors.body}</span>}
                            </div>
                        </div>

                        {/* Extra Settings Card */}
                        <div className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm flex flex-col gap-4">
                            <h2 className="text-lg font-semibold text-foreground">Post Configuration</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="difficulty">Difficulty Level</Label>
                                    <select
                                        id="difficulty"
                                        value={data.difficulty}
                                        onChange={e => setData('difficulty', e.target.value as any)}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="estimated_time">Estimated Reading Time</Label>
                                    <Input
                                        id="estimated_time"
                                        value={data.estimated_time}
                                        onChange={e => setData('estimated_time', e.target.value)}
                                        placeholder="e.g. 5 min read"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    value={tagsInput}
                                    onChange={e => handleTagsChange(e.target.value)}
                                    placeholder="Laravel, React, Inertia, SEO"
                                    className="mt-1"
                                />
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {data.tags.map(t => (
                                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Main Image</Label>
                                <div className="flex flex-wrap gap-4 mt-2 mb-3">
                                    {post.main_image && (
                                        <div className="relative max-w-[200px] rounded-lg overflow-hidden border border-sidebar-border p-1 bg-muted/10">
                                            <img 
                                                src={post.main_image.startsWith('/') ? `${asset_url.replace(/\/$/, '')}${post.main_image}` : post.main_image} 
                                                alt="Current" 
                                                className="w-full h-auto object-cover rounded" 
                                            />
                                            <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">Current</span>
                                        </div>
                                    )}
                                    {imagePreview && (
                                        <div className="relative max-w-[200px] rounded-lg overflow-hidden border border-primary/40 p-1 bg-muted/10">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-auto object-cover rounded" 
                                            />
                                            <span className="absolute bottom-1.5 right-1.5 bg-primary/80 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">Preview</span>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const files = e.target.files;

                                        if (files && files.length > 0) {
                                            const file = files[0];
                                            setData('main_image', file);
                                            if (imagePreview) URL.revokeObjectURL(imagePreview);
                                            setImagePreview(URL.createObjectURL(file));
                                        } else {
                                            setData('main_image', null);
                                            if (imagePreview) URL.revokeObjectURL(imagePreview);
                                            setImagePreview(null);
                                        }
                                    }}
                                    className="mt-1 cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="published_at">Publish Date (Leave empty for Draft)</Label>
                                    <Input
                                        type="datetime-local"
                                        id="published_at"
                                        value={data.published_at}
                                        onChange={e => setData('published_at', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* SEO Analytics Panel */}
                        <div className="rounded-xl border border-sidebar-border bg-card p-6 shadow-sm flex flex-col gap-4 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">SEO Real-time Analyzer</h2>
                                <Badge className="text-xs bg-green-500 hover:bg-green-600">
                                    Score: {seoAnalysis.score}/100
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <Label htmlFor="focus_keyword">Focus Keyword</Label>
                                    <Input
                                        id="focus_keyword"
                                        value={data.focus_keyword}
                                        onChange={e => setData('focus_keyword', e.target.value)}
                                        placeholder="e.g. Laravel 11"
                                        className="mt-1"
                                    />
                                </div>

                                {/* Checklist */}
                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex items-center justify-between text-xs border-b border-sidebar-border/50 pb-2">
                                        <span className="text-muted-foreground">Title length ({seoAnalysis.titleLength} chars):</span>
                                        {seoAnalysis.titleStatus === 'good' ? (
                                            <span className="text-green-600 dark:text-green-400 font-medium">30-60 chars (Excellent)</span>
                                        ) : (
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">Needs adjustment</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs border-b border-sidebar-border/50 pb-2">
                                        <span className="text-muted-foreground">Meta description length ({seoAnalysis.descLength} chars):</span>
                                        {seoAnalysis.descStatus === 'good' ? (
                                            <span className="text-green-600 dark:text-green-400 font-medium">110-160 chars (Excellent)</span>
                                        ) : (
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">Needs adjustment</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs border-b border-sidebar-border/50 pb-2">
                                        <span className="text-muted-foreground">Keyword in Title:</span>
                                        {seoAnalysis.keywordInTitle ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs border-b border-sidebar-border/50 pb-2">
                                        <span className="text-muted-foreground">Keyword in Description:</span>
                                        {seoAnalysis.keywordInDesc ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs border-b border-sidebar-border/50 pb-2">
                                        <span className="text-muted-foreground">Keyword density:</span>
                                        <span className={seoAnalysis.density >= 0.5 && seoAnalysis.density <= 2.5 ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                                            {seoAnalysis.density.toFixed(2)}% (Target: 0.5% - 2.5%)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs pb-2">
                                        <span className="text-muted-foreground">Alt tags on body images:</span>
                                        {seoAnalysis.hasAltTags ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-sidebar-border" />

                            {/* SEO Metadata Override inputs */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-semibold text-sm">SEO Meta Overrides</h3>
                                
                                <div>
                                    <Label htmlFor="meta_title">Meta Title Override</Label>
                                    <Input
                                        id="meta_title"
                                        value={data.meta_title}
                                        onChange={e => setData('meta_title', e.target.value)}
                                        placeholder="Leave empty to use Post Title"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meta_description">Meta Description Override</Label>
                                    <textarea
                                        id="meta_description"
                                        rows={3}
                                        value={data.meta_description}
                                        onChange={e => setData('meta_description', e.target.value)}
                                        placeholder="Leave empty to use summary"
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="secondary_keywords">Secondary Keywords (comma-separated)</Label>
                                    <Input
                                        id="secondary_keywords"
                                        value={secondaryKeywordsInput}
                                        onChange={e => handleSecondaryKeywordsChange(e.target.value)}
                                        placeholder="Inertia JS, PHP 8.4"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="no_index"
                                        checked={data.no_index}
                                        onChange={e => setData('no_index', e.target.checked)}
                                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                    />
                                    <Label htmlFor="no_index" className="cursor-pointer text-xs font-normal">
                                        Instruct search engines not to index this post (NoIndex)
                                    </Label>
                                </div>
                            </div>

                            <hr className="border-sidebar-border" />

                            {/* Categories assignment */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-semibold text-sm">Assign Categories</h3>
                                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto border border-sidebar-border/50 rounded-lg p-3 bg-muted/20">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`cat-${cat.id}`}
                                                checked={data.category_ids.includes(cat.id)}
                                                onChange={() => handleCategoryToggle(cat.id)}
                                                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer text-xs font-normal">
                                                {cat.title}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" disabled={processing} className="w-full mt-4 gap-2">
                                <Save className="h-4 w-4" />
                                Update Post
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Posts',
            href: '/dashboard/posts',
        },
        {
            title: 'Edit',
            href: '/dashboard/posts/edit',
        },
    ],
};
