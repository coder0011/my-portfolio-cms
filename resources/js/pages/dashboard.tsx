import { Head, Link, router } from '@inertiajs/react';
import { FileText, ThumbsUp, MessageSquare, Users, Edit, Globe, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import admin from '@/routes/admin';
import { dashboard } from '@/routes';

interface Post {
    id: number;
    title: string;
    slug: string;
    published_at: string | null;
    likes_count: number;
    created_at: string;
    categories?: {
        id: number;
        title: string;
    }[];
}

interface Comment {
    id: number;
    name: string;
    comment: string;
    approved: boolean;
    created_at: string;
    post?: {
        id: number;
        title: string;
    };
}

interface Stats {
    posts: number;
    likes: number;
    comments: number;
    subscribers: number;
}

interface DashboardProps {
    stats: Stats;
    recentPosts: Post[];
    recentComments: Comment[];
}

export default function Dashboard({ stats, recentPosts, recentComments }: DashboardProps) {
    const handleApproveComment = (id: number) => {
        router.put(admin.comments.toggleApprove({ comment: id }).url, {}, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="CMS Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Welcome / Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome to your Portfolio CMS</h1>
                    <p className="text-muted-foreground text-sm">
                        Overview of your blog content performance, user comments, and subscriber metrics.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Posts Stat */}
                    <Card className="border-sidebar-border/70 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.posts}</div>
                            <p className="text-xs text-muted-foreground mt-1">Articles published in your blog</p>
                        </CardContent>
                    </Card>

                    {/* Likes Stat */}
                    <Card className="border-sidebar-border/70 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.likes}</div>
                            <p className="text-xs text-muted-foreground mt-1">Reader appreciations across all posts</p>
                        </CardContent>
                    </Card>

                    {/* Comments Stat */}
                    <Card className="border-sidebar-border/70 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Blog Comments</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.comments}</div>
                            <p className="text-xs text-muted-foreground mt-1">Feedback and questions submitted</p>
                        </CardContent>
                    </Card>

                    {/* Subscribers Stat */}
                    <Card className="border-sidebar-border/70 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.subscribers}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active newsletter mailing list members</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Posts Card */}
                    <Card className="border-sidebar-border/70 shadow-sm bg-card flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-md">Recent Posts</CardTitle>
                                <CardDescription>Your latest written articles and drafts</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="gap-1.5">
                                <Link href={admin.posts.index().url}>
                                    View All
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-x-auto">
                            {recentPosts.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No posts found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentPosts.map((post) => (
                                        <div key={post.id} className="flex items-center justify-between gap-4 border-b border-sidebar-border/30 pb-3 last:border-0 last:pb-0">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold truncate text-foreground hover:text-primary transition-colors">
                                                    <Link href={admin.posts.edit({ post: post.id }).url}>
                                                        {post.title}
                                                    </Link>
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {post.published_at ? (
                                                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-green-500/20 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/10">
                                                            <Globe className="h-2.5 w-2.5" />
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/10">
                                                            <Lock className="h-2.5 w-2.5" />
                                                            Draft
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <Link href={admin.posts.edit({ post: post.id }).url}>
                                                    <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Comments Card */}
                    <Card className="border-sidebar-border/70 shadow-sm bg-card flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-md">Recent Comments</CardTitle>
                                <CardDescription>Reader interactions pending moderation</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="gap-1.5">
                                <Link href={admin.comments.index().url}>
                                    Moderate
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {recentComments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No comments found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentComments.map((comment) => {
                                        const isLong = comment.comment.length > 80;
                                        const displayComment = isLong ? `${comment.comment.slice(0, 80)}...` : comment.comment;

                                        return (
                                            <div key={comment.id} className="flex items-start justify-between gap-4 border-b border-sidebar-border/30 pb-3 last:border-0 last:pb-0">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-xs font-semibold text-foreground">{comment.name}</span>
                                                        <span className="text-[9px] text-muted-foreground">•</span>
                                                        {comment.post && (
                                                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px] md:max-w-[200px]">
                                                                on{' '}
                                                                <Link 
                                                                    href={admin.posts.edit({ post: comment.post.id }).url} 
                                                                    className="text-foreground font-semibold hover:text-primary hover:underline transition-colors"
                                                                >
                                                                    {comment.post.title}
                                                                </Link>
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Clicking the comment body redirects directly to the comments section */}
                                                    <Link 
                                                        href={admin.comments.index().url} 
                                                        className="block text-xs text-foreground/90 mt-1 bg-muted/40 hover:bg-muted/70 p-2 rounded border border-sidebar-border/20 transition-colors whitespace-pre-line leading-relaxed"
                                                    >
                                                        {displayComment}
                                                        {isLong && <span className="text-primary font-semibold ml-1 text-[10px]">Read more</span>}
                                                    </Link>
                                                </div>
                                                
                                                <div className="flex items-center self-center gap-1.5">
                                                    {!comment.approved && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => handleApproveComment(comment.id)} 
                                                            className="h-8 gap-1 text-[10px] font-medium border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-green-50 dark:hover:bg-green-950/10"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
