import { Head, useForm } from '@inertiajs/react';
import admin from '@/routes/admin';
import { Plus, Edit, Trash, GraduationCap } from 'lucide-react';
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

interface Education {
    id: number;
    degree: string;
    institution: string;
    period: string;
    description: string | null;
    sort_order: number;
}

export default function Index({ educations }: { educations: Education[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        degree: '',
        institution: '',
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

    const openEditModal = (edu: Education) => {
        clearErrors();
        setEditId(edu.id);
        setData({
            degree: edu.degree,
            institution: edu.institution,
            period: edu.period,
            description: edu.description || '',
            sort_order: edu.sort_order,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            put(admin.educations.update(editId).url, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        } else {
            post(admin.educations.store().url, {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this education entry?')) {
            destroy(admin.educations.destroy(id).url);
        }
    };

    return (
        <>
            <Head title="Academic Timeline" />

            <div className="flex flex-col gap-6 p-6 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Academic Timeline</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your academic qualifications and degrees shown in the portfolio timeline.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Qualification
                    </Button>
                </div>

                {/* Table card */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="p-4 w-[40px]">Order</th>
                                    <th className="p-4">Degree / Qualification</th>
                                    <th className="p-4">Institution</th>
                                    <th className="p-4">Period</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {educations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No qualifications found. Click "Add Qualification" to record your academic timeline!
                                        </td>
                                    </tr>
                                ) : (
                                    educations.map((edu) => (
                                        <tr key={edu.id} className="border-b border-sidebar-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="p-4 font-mono text-xs text-muted-foreground text-center">
                                                {edu.sort_order}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                                    <GraduationCap className="h-4 w-4 text-primary" />
                                                    {edu.degree}
                                                </div>
                                                {edu.description && (
                                                    <div className="text-xs text-muted-foreground mt-1 max-w-[400px] truncate">
                                                        {edu.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-foreground font-medium">
                                                {edu.institution}
                                            </td>
                                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                                                {edu.period}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(edu)}>
                                                        <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)}>
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
                            {editId ? 'Edit Qualification' : 'Add Qualification'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Degree Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="degree" className="text-foreground">Degree / Qualification</Label>
                            <Input
                                id="degree"
                                value={data.degree}
                                onChange={(e) => setData('degree', e.target.value)}
                                required
                                placeholder="BCA (Bachelor of Computer Applications)"
                                className="bg-background border-input text-foreground"
                            />
                            <InputError message={errors.degree} />
                        </div>

                        {/* Institution Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="institution" className="text-foreground">Institution / University</Label>
                            <Input
                                id="institution"
                                value={data.institution}
                                onChange={(e) => setData('institution', e.target.value)}
                                required
                                placeholder="Maharishi Arvind University"
                                className="bg-background border-input text-foreground"
                            />
                            <InputError message={errors.institution} />
                        </div>

                        {/* Period */}
                        <div className="grid gap-2">
                            <Label htmlFor="period" className="text-foreground">Time Period</Label>
                            <Input
                                id="period"
                                value={data.period}
                                onChange={(e) => setData('period', e.target.value)}
                                required
                                placeholder="2021 - 2023"
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
                            <Label htmlFor="description" className="text-foreground">Details (Optional)</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add notes, specializations, or GPA accomplishments..."
                                rows={3}
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
            title: 'Academic Timeline',
            href: '/dashboard/educations',
        },
    ],
};
