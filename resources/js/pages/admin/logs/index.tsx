import { Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Log {
    id: number;
    action: string;
    description: string | null;
    ip_address: string | null;
    created_at: string;
    user?: {
        name: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedLogs {
    data: Log[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function Index({ logs }: { logs: PaginatedLogs }) {
    return (
        <>
            <Head title="Audit Logs" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground text-sm">
                        Monitor admin dashboard activity, login history, and editor modifications.
                    </p>
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">IP Address</th>
                                    <th className="p-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShieldAlert className="h-6 w-6 text-muted-foreground/60" />
                                                No activity logs found.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="border-b border-sidebar-border/50 hover:bg-muted/10 transition-colors">
                                            <td className="p-4 font-medium text-foreground">
                                                {log.user?.name ?? 'System'}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
                                                    {log.action.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-foreground/90 max-w-[400px] truncate" title={log.description ?? ''}>
                                                {log.description ?? '—'}
                                            </td>
                                            <td className="p-4 text-muted-foreground font-mono text-xs">
                                                {log.ip_address ?? '—'}
                                            </td>
                                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border p-4 bg-muted/20">
                            <div className="text-xs text-muted-foreground">
                                Showing page {logs.current_page} of {logs.last_page} ({logs.total} total logs)
                            </div>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            if (link.url) {
window.location.href = link.url;
}
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
            title: 'Audit Logs',
            href: '/dashboard/logs',
        },
    ],
};
