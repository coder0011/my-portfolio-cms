import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash, Globe, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import admin from '@/routes/admin';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    main_image: string | null;
    published_at: string | null;
    likes_count: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimated_time: string | null;
    tags: string[] | null;
    no_index: boolean;
    comments_count?: number;
    user?: {
        name: string;
    };
    categories?: {
        id: number;
        title: string;
    }[];
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPosts {
    data: Post[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function Index({ posts }: { posts: PaginatedPosts }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (
            confirm(
                'Are you sure you want to delete this post? This action cannot be undone.',
            )
        ) {
            destroy(admin.posts.destroy({ post: id }).url, {
                onSuccess: () => {
                    // Success toast is handled globally or via sessions
                },
            });
        }
    };

    const getDifficultyBadgeVariant = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'secondary';
            case 'intermediate':
                return 'default';
            case 'advanced':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <>
            <Head title="Manage Posts" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Blog Posts
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your portfolio blog posts, SEO metadata, and
                            category assignments.
                        </p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href={admin.posts.create().url}>
                            <Plus className="h-4 w-4" />
                            Create Post
                        </Link>
                    </Button>
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Author</th>
                                    <th className="p-4">Categories</th>
                                    <th className="p-4">Difficulty</th>
                                    <th className="p-4">Status / Index</th>
                                    <th className="p-4">Comments</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            No posts found. Click "Create Post"
                                            to write your first article!
                                        </td>
                                    </tr>
                                ) : (
                                    posts.data.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="border-b border-sidebar-border/50 transition-colors hover:bg-muted/20"
                                        >
                                            <td className="max-w-[300px] p-4">
                                                <div className="truncate font-semibold text-foreground">
                                                    {post.title}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {post.slug}
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {post.user?.name ?? 'Unknown'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {post.categories &&
                                                    post.categories.length >
                                                        0 ? (
                                                        post.categories.map(
                                                            (cat) => (
                                                                <Badge
                                                                    key={cat.id}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {cat.title}
                                                                </Badge>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 capitalize">
                                                <Badge
                                                    variant={getDifficultyBadgeVariant(
                                                        post.difficulty,
                                                    )}
                                                    className="text-xs"
                                                >
                                                    {post.difficulty}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {post.published_at ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 border-green-500/30 bg-green-50/50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                                                        >
                                                            <Globe className="h-3 w-3" />
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 border-amber-500/30 bg-amber-50/50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                                                        >
                                                            <Lock className="h-3 w-3" />
                                                            Draft
                                                        </Badge>
                                                    )}
                                                    {post.no_index && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-red-500/30 text-xs text-red-500"
                                                        >
                                                            NoIndex
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {post.comments_count !==
                                                undefined ? (
                                                    <Link
                                                        href={`${admin.comments.index().url}?post_id=${post.id}`}
                                                        className="font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                                                    >
                                                        {post.comments_count}{' '}
                                                        {post.comments_count ===
                                                        1
                                                            ? 'comment'
                                                            : 'comments'}
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-muted-foreground">
                                                {post.published_at
                                                    ? new Date(
                                                          post.published_at,
                                                      ).toLocaleDateString()
                                                    : new Date(
                                                          post.created_at,
                                                      ).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={
                                                                admin.posts.edit(
                                                                    {
                                                                        post: post.id,
                                                                    },
                                                                ).url
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                post.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {posts.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border bg-muted/20 p-4">
                            <div className="text-xs text-muted-foreground">
                                Showing page {posts.current_page} of{' '}
                                {posts.last_page} ({posts.total} total posts)
                            </div>
                            <div className="flex items-center gap-1">
                                {posts.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        asChild={!!link.url}
                                        disabled={!link.url}
                                        className="h-8 min-w-[32px] px-2 text-xs"
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Posts',
            href: '/dashboard/posts',
        },
    ],
};
