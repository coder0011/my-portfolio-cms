import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import DualEditor from '@/components/DualEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSeoAnalysis } from '@/hooks/use-seo-analysis';
import admin from '@/routes/admin';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        excerpt: '',
        body: '',
        main_image: null as File | null,
        published_at: '',
        difficulty: 'beginner',
        estimated_time: '',
        tags: [] as string[],
        meta_title: '',
        meta_description: '',
        focus_keyword: '',
        secondary_keywords: [] as string[],
        no_index: false,
        categories: [] as string[],
        faqs: [] as { question: string; answer: string }[],
    });

    const [tagsInput, setTagsInput] = useState('');
    const [secondaryKeywordsInput, setSecondaryKeywordsInput] = useState('');
    const [categoriesInput, setCategoriesInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Auto-generate slug from title
    useEffect(() => {
        if (data.title) {
            const generatedSlug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setData('slug', generatedSlug);
        }
    }, [data.title, setData]);

    // Handle tags parsing
    const handleTagsChange = (val: string) => {
        setTagsInput(val);
        const parsed = val
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        setData('tags', parsed);
    };

    // Handle secondary keywords parsing
    const handleSecondaryKeywordsChange = (val: string) => {
        setSecondaryKeywordsInput(val);
        const parsed = val
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
        setData('secondary_keywords', parsed);
    };

    // Handle categories parsing
    const handleCategoriesChange = (val: string) => {
        setCategoriesInput(val);
        const parsed = val
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
        setData('categories', parsed);
    };

    const handleAddFaq = () => {
        const newFaqs = [...(data.faqs || []), { question: '', answer: '' }];
        setData('faqs', newFaqs);
    };

    const handleRemoveFaq = (index: number) => {
        const newFaqs = [...(data.faqs || [])];
        newFaqs.splice(index, 1);
        setData('faqs', newFaqs);
    };

    const handleFaqChange = (
        index: number,
        field: 'question' | 'answer',
        value: string,
    ) => {
        const newFaqs = [...(data.faqs || [])];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setData('faqs', newFaqs);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.posts.store().url, {
            onSuccess: () => {
                // Done
            },
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
            <Head title="Create New Post" />

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                {/* Top Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={admin.posts.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Create Post
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Write a new article for your portfolio site.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form + SEO sidebar */}
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Editor Card */}
                        <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
                            <div>
                                <Label htmlFor="title">Post Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="e.g. My Awesome Portfolio Journey"
                                    className="mt-1"
                                />
                                {errors.title && (
                                    <span className="mt-1 text-xs text-destructive">
                                        {errors.title}
                                    </span>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug (URL Path)</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    placeholder="my-awesome-portfolio-journey"
                                    className="mt-1 font-mono text-sm"
                                />
                                {errors.slug && (
                                    <span className="mt-1 text-xs text-destructive">
                                        {errors.slug}
                                    </span>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="excerpt">
                                    Excerpt / Summary
                                </Label>
                                <textarea
                                    id="excerpt"
                                    rows={2}
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData('excerpt', e.target.value)
                                    }
                                    placeholder="Write a brief, catchy summary of the post..."
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                {errors.excerpt && (
                                    <span className="mt-1 text-xs text-destructive">
                                        {errors.excerpt}
                                    </span>
                                )}
                            </div>

                            <div>
                                <Label className="mb-2 block">
                                    Markdown Content
                                </Label>
                                <DualEditor
                                    value={data.body}
                                    onChange={(val) => setData('body', val)}
                                    placeholder="Write your article body using Markdown..."
                                    error={errors.body}
                                />
                            </div>
                        </div>

                        {/* Extra Settings Card */}
                        <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-foreground">
                                Post Configuration
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="difficulty">
                                        Difficulty Level
                                    </Label>
                                    <select
                                        id="difficulty"
                                        value={data.difficulty}
                                        onChange={(e) =>
                                            setData(
                                                'difficulty',
                                                e.target.value as any,
                                            )
                                        }
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                                    >
                                        <option value="beginner">
                                            Beginner
                                        </option>
                                        <option value="intermediate">
                                            Intermediate
                                        </option>
                                        <option value="advanced">
                                            Advanced
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="estimated_time">
                                        Estimated Reading Time
                                    </Label>
                                    <Input
                                        id="estimated_time"
                                        value={data.estimated_time}
                                        onChange={(e) =>
                                            setData(
                                                'estimated_time',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. 5 min read"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="tags">
                                    Tags (comma-separated)
                                </Label>
                                <Input
                                    id="tags"
                                    value={tagsInput}
                                    onChange={(e) =>
                                        handleTagsChange(e.target.value)
                                    }
                                    placeholder="Laravel, React, Inertia, SEO"
                                    className="mt-1"
                                />
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {data.tags.map((t) => (
                                        <Badge
                                            key={t}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {t}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Main Image</Label>
                                {imagePreview && (
                                    <div className="relative mt-2 mb-3 max-w-[200px] overflow-hidden rounded-lg border border-primary/40 bg-muted/10 p-1">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-auto w-full rounded object-cover"
                                        />
                                        <span className="absolute right-1.5 bottom-1.5 rounded bg-primary/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                            Preview
                                        </span>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = e.target.files;

                                        if (files && files.length > 0) {
                                            const file = files[0];
                                            setData('main_image', file);

                                            if (imagePreview) {
                                                URL.revokeObjectURL(
                                                    imagePreview,
                                                );
                                            }

                                            setImagePreview(
                                                URL.createObjectURL(file),
                                            );
                                        } else {
                                            setData('main_image', null);

                                            if (imagePreview) {
                                                URL.revokeObjectURL(
                                                    imagePreview,
                                                );
                                            }

                                            setImagePreview(null);
                                        }
                                    }}
                                    className="mt-1 cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="published_at">
                                        Publish Date (Leave empty for Draft)
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        id="published_at"
                                        value={data.published_at}
                                        onChange={(e) =>
                                            setData(
                                                'published_at',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FAQ Editor Card */}
                        <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Structured FAQs (Optional)
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Add questions and answers that will be
                                        formatted as an accordion and rich
                                        schema.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddFaq}
                                >
                                    Add Q&A
                                </Button>
                            </div>

                            {data.faqs && data.faqs.length > 0 ? (
                                <div className="mt-2 flex flex-col gap-4">
                                    {data.faqs.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="relative flex flex-col gap-3 rounded-lg border border-sidebar-border bg-muted/10 p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    FAQ Item #{index + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() =>
                                                        handleRemoveFaq(index)
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div>
                                                <Label className="text-xs">
                                                    Question
                                                </Label>
                                                <Input
                                                    value={faq.question}
                                                    onChange={(e) =>
                                                        handleFaqChange(
                                                            index,
                                                            'question',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter question..."
                                                    className="mt-1 h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">
                                                    Answer
                                                </Label>
                                                <textarea
                                                    rows={3}
                                                    value={faq.answer}
                                                    onChange={(e) =>
                                                        handleFaqChange(
                                                            index,
                                                            'answer',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter answer..."
                                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-sidebar-border bg-muted/5 py-6 text-center text-sm text-muted-foreground">
                                    No custom FAQs added. Click "Add Q&A" to get
                                    started.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* SEO Analytics Panel */}
                        <div className="sticky top-6 flex flex-col gap-4 rounded-xl border border-sidebar-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">
                                    SEO Real-time Analyzer
                                </h2>
                                <Badge className="bg-green-500 text-xs hover:bg-green-600">
                                    Score: {seoAnalysis.score}/100
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <Label htmlFor="focus_keyword">
                                        Focus Keyword
                                    </Label>
                                    <Input
                                        id="focus_keyword"
                                        value={data.focus_keyword}
                                        onChange={(e) =>
                                            setData(
                                                'focus_keyword',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Laravel 11"
                                        className="mt-1"
                                    />
                                </div>

                                {/* Checklist */}
                                <div className="mt-2 flex flex-col gap-2">
                                    <div className="flex items-center justify-between border-b border-sidebar-border/50 pb-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Title length (
                                            {seoAnalysis.titleLength} chars):
                                        </span>
                                        {seoAnalysis.titleStatus === 'good' ? (
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                30-60 chars (Excellent)
                                            </span>
                                        ) : (
                                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                                Needs adjustment
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-b border-sidebar-border/50 pb-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Meta description length (
                                            {seoAnalysis.descLength} chars):
                                        </span>
                                        {seoAnalysis.descStatus === 'good' ? (
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                110-160 chars (Excellent)
                                            </span>
                                        ) : (
                                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                                Needs adjustment
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-b border-sidebar-border/50 pb-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Keyword in Title:
                                        </span>
                                        {seoAnalysis.keywordInTitle ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-b border-sidebar-border/50 pb-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Keyword in Description:
                                        </span>
                                        {seoAnalysis.keywordInDesc ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-b border-sidebar-border/50 pb-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Keyword density in content:
                                        </span>
                                        <span
                                            className={
                                                seoAnalysis.density >= 0.5 &&
                                                seoAnalysis.density <= 2.5
                                                    ? 'font-semibold text-green-600'
                                                    : 'font-semibold text-amber-600'
                                            }
                                        >
                                            {seoAnalysis.density.toFixed(2)}%
                                            (Target: 0.5% - 2.5%)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pb-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Alt tags on body images:
                                        </span>
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
                                <h3 className="text-sm font-semibold">
                                    SEO Meta Overrides
                                </h3>

                                <div>
                                    <Label htmlFor="meta_title">
                                        Meta Title Override
                                    </Label>
                                    <Input
                                        id="meta_title"
                                        value={data.meta_title}
                                        onChange={(e) =>
                                            setData(
                                                'meta_title',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Leave empty to use Post Title"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="meta_description">
                                        Meta Description Override
                                    </Label>
                                    <textarea
                                        id="meta_description"
                                        rows={3}
                                        value={data.meta_description}
                                        onChange={(e) =>
                                            setData(
                                                'meta_description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Leave empty to use summary"
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="secondary_keywords">
                                        Secondary Keywords (comma-separated)
                                    </Label>
                                    <Input
                                        id="secondary_keywords"
                                        value={secondaryKeywordsInput}
                                        onChange={(e) =>
                                            handleSecondaryKeywordsChange(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Inertia JS, PHP 8.4"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="no_index"
                                        checked={data.no_index}
                                        onChange={(e) =>
                                            setData(
                                                'no_index',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                    />
                                    <Label
                                        htmlFor="no_index"
                                        className="cursor-pointer text-xs font-normal"
                                    >
                                        Instruct search engines not to index
                                        this post (NoIndex)
                                    </Label>
                                </div>
                            </div>

                            <hr className="border-sidebar-border" />

                            {/* Categories assignment */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="categories">
                                    Categories (comma-separated)
                                </Label>
                                <Input
                                    id="categories"
                                    type="text"
                                    value={categoriesInput}
                                    onChange={(e) =>
                                        handleCategoriesChange(e.target.value)
                                    }
                                    placeholder="e.g. Angular, Deployment, DevOps"
                                    className="bg-card text-xs"
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    Separate individual categories with commas.
                                </span>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="mt-4 w-full gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Post
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = {
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
            title: 'Create',
            href: '/dashboard/posts/create',
        },
    ],
};
