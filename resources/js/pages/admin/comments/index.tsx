import { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle, Trash, MessageSquare, ArrowLeft, Edit, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

interface Post {
    id: number;
    title: string;
}

interface Comment {
    id: number;
    post_id: number;
    name: string;
    comment: string;
    user_id: string | null;
    approved: boolean;
    created_at: string;
    post?: Post;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedComments {
    data: Comment[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface IndexProps {
    comments: PaginatedComments;
    selectedPostId: number | null;
}

export default function Index({ comments, selectedPostId }: IndexProps) {
    const { delete: destroy } = useForm();
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggleApprove = (id: number) => {
        router.put(admin.comments.toggleApprove({ comment: id }).url, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            destroy(admin.comments.destroy({ comment: id }).url, {
                preserveScroll: true,
            });
        }
    };

    const formatCommentDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr.replace(' ', 'T'));
        return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
    };

    const handleOpenModal = (comment: Comment) => {
        setSelectedComment(comment);
        setCommentText(comment.comment || '');
        setReplyText('');
        setIsEditing(false);
    };

    const handleUpdateComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComment) return;

        setIsSubmitting(true);
        router.put(admin.comments.update({ comment: selectedComment.id }).url, {
            comment: commentText,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                setIsSubmitting(false);
                setSelectedComment({
                    ...selectedComment,
                    comment: commentText,
                });
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handlePostReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComment) return;

        setIsSubmitting(true);
        router.post(admin.comments.reply({ comment: selectedComment.id }).url, {
            comment: replyText,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setReplyText('');
                setIsSubmitting(false);
                setSelectedComment(null);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <>
            <Head title="Moderate Comments" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Blog Comments</h1>
                        <p className="text-muted-foreground text-sm">
                            Approve, view, reply, or remove reader comments on your blog posts. Comments only show publicly after approval.
                        </p>
                    </div>
                    {selectedPostId && (
                        <Button variant="outline" size="sm" asChild className="gap-1.5 self-start">
                            <Link href={admin.comments.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                                Clear Post Filter
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Comments List */}
                <div className="grid gap-4">
                    {comments.data.length === 0 ? (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-12 text-center text-muted-foreground">
                            <MessageSquare className="mx-auto h-8 w-8 mb-4 text-muted-foreground/55" />
                            No comments found!
                        </div>
                    ) : (
                        comments.data.map((comment) => (
                            <div
                                key={comment.id}
                                className={`rounded-xl border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all ${
                                    comment.approved 
                                        ? 'border-sidebar-border/70' 
                                        : 'border-amber-500/30 bg-amber-500/[0.01] dark:bg-amber-500/[0.005]'
                                }`}
                            >
                                <div className="flex-1 flex flex-col gap-3">
                                    {/* Meta bar */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="font-semibold text-foreground text-sm">{comment.name}</span>
                                        {comment.user_id && (
                                            <span className="text-muted-foreground text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                                ID: {comment.user_id.slice(0, 8)}
                                            </span>
                                        )}
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">
                                            {formatCommentDate(comment.created_at)}
                                        </span>
                                        {comment.post && (
                                            <>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    on{' '}
                                                    <Link 
                                                        href={admin.posts.edit({ post: comment.post.id }).url} 
                                                        className="font-semibold text-foreground hover:text-primary hover:underline transition-colors max-w-[150px] md:max-w-[250px] truncate"
                                                    >
                                                        {comment.post.title}
                                                    </Link>
                                                </span>
                                            </>
                                        )}
                                        
                                        {!comment.approved && (
                                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-[10px] ml-auto md:ml-0 font-medium">
                                                Pending Approval
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Comment text */}
                                    <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/30 p-3 rounded-lg border border-sidebar-border/30">
                                        {comment.comment}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center md:self-center gap-2 self-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenModal(comment)}
                                        className="gap-1.5 h-9"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit / Reply
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleApprove(comment.id)}
                                        className={`gap-1.5 h-9 ${
                                            comment.approved
                                                ? 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/10'
                                                : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                                        }`}
                                    >
                                        {comment.approved ? (
                                            <>
                                                <XCircle className="h-4 w-4" />
                                                Unapprove
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approve
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {comments.last_page > 1 && (
                    <div className="flex items-center justify-between border border-sidebar-border rounded-xl p-4 bg-muted/20">
                        <div className="text-xs text-muted-foreground">
                            Showing page {comments.current_page} of {comments.last_page} ({comments.total} total comments)
                        </div>
                        <div className="flex items-center gap-1">
                            {comments.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        if (link.url) window.location.href = link.url;
                                    }}
                                    disabled={!link.url}
                                    className="h-8 min-w-[32px] px-2 text-xs"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Comment Edit/Reply Modal */}
            <Dialog open={selectedComment !== null} onOpenChange={(open) => !open && setSelectedComment(null)}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Manage Comment: {selectedComment?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Submitted on {selectedComment?.created_at && formatCommentDate(selectedComment.created_at)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedComment && (
                        <div className="flex flex-col gap-4 mt-2">
                            {/* Comment Editor */}
                            <div className="rounded-lg border border-sidebar-border bg-muted/40 p-4">
                                <div className="text-xs text-muted-foreground mb-1.5 flex items-center justify-between">
                                    <span>Article: <strong>{selectedComment.post?.title}</strong></span>
                                    <Badge variant={selectedComment.approved ? 'default' : 'secondary'} className="text-[9px] py-0 px-1.5">
                                        {selectedComment.approved ? 'Approved' : 'Pending Approval'}
                                    </Badge>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdateComment} className="flex flex-col gap-3">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            rows={4}
                                            className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm text-foreground/90 whitespace-pre-line">
                                            {selectedComment.comment}
                                        </p>
                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 text-xs text-muted-foreground hover:text-primary">
                                                <Edit className="h-3.5 w-3.5 mr-1" />
                                                Edit Comment
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Admin Reply Form */}
                            <form onSubmit={handlePostReply} className="flex flex-col gap-3 border-t border-sidebar-border pt-4">
                                <Label htmlFor="reply" className="flex items-center gap-1.5 text-sm font-semibold">
                                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                    Post a Reply (as Admin)
                                </Label>
                                <textarea
                                    id="reply"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your response to this reader..."
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <div className="flex justify-end gap-2">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            Close
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" size="sm" disabled={isSubmitting}>
                                        Submit Reply
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
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
            title: 'Comments',
            href: '/dashboard/comments',
        },
    ],
};
