import { Head, useForm } from '@inertiajs/react';
import { Mail, Trash, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import admin from '@/routes/admin';

interface Subscriber {
    id: number;
    email: string;
    verified_at: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSubscribers {
    data: Subscriber[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function Index({
    subscribers,
}: {
    subscribers: PaginatedSubscribers;
}) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this subscriber?')) {
            destroy(admin.subscribers.destroy({ subscriber: id }).url, {
                onSuccess: () => {
                    // Done
                },
            });
        }
    };

    return (
        <>
            <Head title="Newsletter Subscribers" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Newsletter Subscribers
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your blog mailing list and newsletter
                        subscribers.
                    </p>
                </div>

                {/* Subscribers Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="p-4">Email Address</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Subscribed Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Mail className="h-6 w-6 text-muted-foreground/60" />
                                                No subscribers found yet.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.data.map((sub) => (
                                        <tr
                                            key={sub.id}
                                            className="border-b border-sidebar-border/50 transition-colors hover:bg-muted/10"
                                        >
                                            <td className="p-4 font-medium text-foreground">
                                                {sub.email}
                                            </td>
                                            <td className="p-4">
                                                {sub.verified_at ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                                                        <UserCheck className="h-3 w-3" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-muted-foreground">
                                                {new Date(
                                                    sub.created_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(sub.id)
                                                    }
                                                    className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {subscribers.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border bg-muted/20 p-4">
                            <div className="text-xs text-muted-foreground">
                                Showing page {subscribers.current_page} of{' '}
                                {subscribers.last_page} ({subscribers.total}{' '}
                                total subscribers)
                            </div>
                            <div className="flex items-center gap-1">
                                {subscribers.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => {
                                            if (link.url) {
                                                window.location.href = link.url;
                                            }
                                        }}
                                        disabled={!link.url}
                                        className="h-8 min-w-[32px] px-2 text-xs"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
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
            title: 'Subscribers',
            href: '/dashboard/subscribers',
        },
    ],
};
