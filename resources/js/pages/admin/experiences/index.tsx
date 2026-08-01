import { Head, useForm } from '@inertiajs/react';
import admin from '@/routes/admin';
import { Plus, Edit, Trash, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';

interface Experience {
    id: number;
    job_title: string;
    company: string;
    period: string;
    description: string | null;
    sort_order: number;
}

export default function Index({ experiences }: { experiences: Experience[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        job_title: '',
        company: '',
        period: '',
        description: '',
        sort_order: 0,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditId(null);
        setIsOpen(true);
    };

    const openEditModal = (exp: Experience) => {
        clearErrors();
        setEditId(exp.id);
        setData({
            job_title: exp.job_title,
            company: exp.company,
            period: exp.period,
            description: exp.description || '',
            sort_order: exp.sort_order,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            put(admin.experiences.update(editId).url, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        } else {
            post(admin.experiences.store().url, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this experience entry?')) {
            destroy(admin.experiences.destroy(id).url);
        }
    };

    return (
        <>
            <Head title="Professional Timeline" />

            <div className="flex flex-col gap-6 p-6 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Professional Timeline</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your professional work history and titles shown in the portfolio timeline.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Experience
                    </Button>
                </div>

                {/* Table card */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="p-4 w-[40px]">Order</th>
                                    <th className="p-4">Job Title</th>
                                    <th className="p-4">Company</th>
                                    <th className="p-4">Period</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experiences.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No experience records found. Click "Add Experience" to add your professional history!
                                        </td>
                                    </tr>
                                ) : (
                                    experiences.map((exp) => (
                                        <tr key={exp.id} className="border-b border-sidebar-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="p-4 font-mono text-xs text-muted-foreground text-center">
                                                {exp.sort_order}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                                    <Briefcase className="h-4 w-4 text-primary" />
                                                    {exp.job_title}
                                                </div>
                                                {exp.description && (
                                                    <div className="text-xs text-muted-foreground mt-1 max-w-[400px] truncate">
                                                        {exp.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-foreground font-medium">
                                                {exp.company}
                                            </td>
                                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                                                {exp.period}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(exp)}>
                                                        <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
                                                        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CRUD Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md bg-sidebar text-sidebar-foreground border-sidebar-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {editId ? 'Edit Experience' : 'Add Experience'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Job Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="job_title" className="text-foreground">Job Title</Label>
                            <Input
                                id="job_title"
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                                required
                                placeholder="Sr. Software Engineer"
                                className="bg-background border-input text-foreground"
                            />
                            <InputError message={errors.job_title} />
                        </div>

                        {/* Company Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="company" className="text-foreground">Company Name</Label>
                            <Input
                                id="company"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                required
                                placeholder="Kadam Technologies P.V.T L.T.D"
                                className="bg-background border-input text-foreground"
                            />
                            <InputError message={errors.company} />
                        </div>

                        {/* Period */}
                        <div className="grid gap-2">
                            <Label htmlFor="period" className="text-foreground">Time Period</Label>
                            <Input
                                id="period"
                                value={data.period}
                                onChange={(e) => setData('period', e.target.value)}
                                required
                                placeholder="2021 - Present"
                                className="bg-background border-input text-foreground"
                            />
                            <InputError message={errors.period} />
                        </div>

                        {/* Sort Order */}
                        <div className="grid gap-2">
                            <Label htmlFor="sort_order" className="text-foreground">Display Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                required
                                placeholder="1"
                                className="bg-background border-input text-foreground"
                            />
                            <InputError message={errors.sort_order} />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-foreground">Description & Key Contributions</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add notes, key achievements, technologies used, or bullet point details..."
                                rows={4}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <DialogFooter className="pt-4 border-t border-sidebar-border/50">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="bg-background text-foreground border-input">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Entry'}
                            </Button>
                        </DialogFooter>
                    </form>
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
            title: 'Professional Experience',
            href: '/dashboard/experiences',
        },
    ],
};
