import { Head, useForm } from '@inertiajs/react';
import { Mail, Trash, Eye, Clock, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import admin from '@/routes/admin';

interface Contact {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedContacts {
    data: Contact[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function Index({ contacts }: { contacts: PaginatedContacts }) {
    const { delete: destroy } = useForm();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );

    const handleDelete = (id: number) => {
        if (
            confirm('Are you sure you want to remove this contact submission?')
        ) {
            destroy(admin.contacts.destroy({ contact: id }).url, {
                onSuccess: () => {
                    if (selectedContact?.id === id) {
                        setSelectedContact(null);
                    }
                },
            });
        }
    };

    return (
        <>
            <Head title="Contact Inquiries" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Contact Inquiries
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage messages from people who tried to
                        contact you from your portfolio website.
                    </p>
                </div>

                {/* Contacts Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Subject</th>
                                    <th className="p-4">Message Preview</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Mail className="h-6 w-6 text-muted-foreground/60" />
                                                No contact messages found yet.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.data.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className="border-b border-sidebar-border/50 transition-colors hover:bg-muted/10"
                                        >
                                            <td className="p-4 font-medium whitespace-nowrap text-foreground">
                                                {contact.name}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-muted-foreground">
                                                {contact.email}
                                            </td>
                                            <td className="max-w-[150px] truncate p-4 font-medium whitespace-nowrap text-foreground">
                                                {contact.subject}
                                            </td>
                                            <td className="max-w-[250px] truncate p-4 text-muted-foreground">
                                                {contact.message}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-muted-foreground">
                                                {new Date(
                                                    contact.created_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setSelectedContact(
                                                                        contact,
                                                                    )
                                                                }
                                                                className="text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="border border-sidebar-border bg-card sm:max-w-[600px]">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                                                                    <Mail className="h-5 w-5 text-primary" />
                                                                    {
                                                                        selectedContact?.subject
                                                                    }
                                                                </DialogTitle>
                                                                <DialogDescription className="text-xs">
                                                                    Inquiry
                                                                    Details
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            {selectedContact && (
                                                                <div className="mt-4 flex flex-col gap-4">
                                                                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-sidebar-border/50 bg-muted/40 p-3 text-xs">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                                                From
                                                                                Name
                                                                            </span>
                                                                            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                                                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                {
                                                                                    selectedContact.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                                                Email
                                                                                Address
                                                                            </span>
                                                                            <span className="flex items-center gap-1.5 font-semibold text-foreground select-all">
                                                                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                {
                                                                                    selectedContact.email
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-span-2 flex flex-col gap-1 border-t border-sidebar-border/50 pt-2">
                                                                            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                                                Date
                                                                                &
                                                                                Time
                                                                            </span>
                                                                            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                                                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                {new Date(
                                                                                    selectedContact.created_at,
                                                                                ).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-xs text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                                                            Message
                                                                        </span>
                                                                        <div className="max-h-[300px] overflow-y-auto rounded-lg border border-sidebar-border/50 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                                                            {
                                                                                selectedContact.message
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-2 flex items-center justify-between border-t border-sidebar-border pt-4">
                                                                        <Button
                                                                            variant="destructive"
                                                                            onClick={() => {
                                                                                handleDelete(
                                                                                    selectedContact.id,
                                                                                );
                                                                            }}
                                                                            className="flex items-center gap-1.5"
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                            Delete
                                                                            Message
                                                                        </Button>
                                                                        <a
                                                                            href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                                                            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                                                                        >
                                                                            Reply
                                                                            via
                                                                            Email
                                                                            <ArrowRight className="h-4 w-4" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                contact.id,
                                                            )
                                                        }
                                                        className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash className="h-4 w-4" />
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
                    {contacts.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border bg-muted/20 p-4">
                            <div className="text-xs text-muted-foreground">
                                Showing page {contacts.current_page} of{' '}
                                {contacts.last_page} ({contacts.total} total
                                inquiries)
                            </div>
                            <div className="flex items-center gap-1">
                                {contacts.links.map((link, i) => (
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
            title: 'Contact Inquiries',
            href: '/dashboard/contacts',
        },
    ],
};
