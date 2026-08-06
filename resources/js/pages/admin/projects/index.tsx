import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash, FolderGit2, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

interface AdditionalLink {
    title: string;
    url: string;
}

interface Project {
    id: number;
    title: string;
    subtitle: string;
    role: string;
    link: string | null;
    links_additional: AdditionalLink[] | null;
    description: string;
    image_path: string;
    project_folder: string | null;
    images_count: number;
    screenshots?: string[];
    is_featured: boolean;
    sort_order: number;
}

export default function Index({ projects }: { projects: Project[] }) {
    const { asset_url } = usePage<any>().props;

    const getFullUrl = (path: string | null) => {
        if (!path) {
            return '';
        }

        if (path.startsWith('http') || path.startsWith('blob:')) {
            return path;
        }

        return `${asset_url.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const {
        data,
        setData,
        post,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        _method: 'POST' as 'POST' | 'PUT',
        title: '',
        subtitle: '',
        role: '',
        link: '',
        links_additional: [] as AdditionalLink[],
        description: '',
        image_path: '',
        project_folder: '',
        is_featured: false,
        sort_order: 0,
        new_images: [] as File[],
        deleted_images: [] as string[],
    });

    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            newPreviews.forEach(URL.revokeObjectURL);
        };
    }, [newPreviews]);

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditId(null);
        setData('_method', 'POST');
        newPreviews.forEach(URL.revokeObjectURL);
        setNewPreviews([]);
        setIsOpen(true);
    };

    const openEditModal = (proj: Project) => {
        clearErrors();
        setEditId(proj.id);
        setData({
            _method: 'PUT',
            title: proj.title,
            subtitle: proj.subtitle,
            role: proj.role,
            link: proj.link || '',
            links_additional: proj.links_additional || [],
            description: proj.description,
            image_path: proj.image_path || '',
            project_folder: proj.project_folder || '',
            is_featured: proj.is_featured,
            sort_order: proj.sort_order,
            new_images: [],
            deleted_images: [],
        });
        newPreviews.forEach(URL.revokeObjectURL);
        setNewPreviews([]);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editId
            ? admin.projects.update(editId).url
            : admin.projects.store().url;
        post(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
                newPreviews.forEach(URL.revokeObjectURL);
                setNewPreviews([]);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            destroy(admin.projects.destroy(id).url);
        }
    };

    const addLinkRow = () => {
        setData('links_additional', [
            ...(data.links_additional || []),
            { title: '', url: '' },
        ]);
    };

    const updateLinkRow = (
        index: number,
        key: 'title' | 'url',
        value: string,
    ) => {
        const updated = [...(data.links_additional || [])];
        updated[index] = { ...updated[index], [key]: value };
        setData('links_additional', updated);
    };

    const removeLinkRow = (index: number) => {
        const updated = [...(data.links_additional || [])];
        updated.splice(index, 1);
        setData('links_additional', updated);
    };

    return (
        <>
            <Head title="Portfolio Projects" />

            <div className="flex flex-col gap-6 p-6 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Portfolio Projects
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage all case studies, mockups, and client
                            projects rendered in your showcase.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Project
                    </Button>
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                    <th className="w-[40px] p-4">Order</th>
                                    <th className="w-[80px] p-4">Featured</th>
                                    <th className="p-4">Project Title</th>
                                    <th className="p-4">Category/Subtitle</th>
                                    <th className="p-4">Screenshots</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            No projects found. Click "Create
                                            Project" to seed your developer
                                            portfolio!
                                        </td>
                                    </tr>
                                ) : (
                                    projects.map((proj) => (
                                        <tr
                                            key={proj.id}
                                            className="border-b border-sidebar-border/50 transition-colors hover:bg-muted/20"
                                        >
                                            <td className="p-4 text-center font-mono text-xs text-muted-foreground">
                                                {proj.sort_order}
                                            </td>
                                            <td className="p-4 text-center">
                                                {proj.is_featured ? (
                                                    <Star className="mx-auto h-4 w-4 fill-amber-400 text-amber-500" />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                                    <FolderGit2 className="h-4 w-4 text-primary" />
                                                    {proj.title}
                                                </div>
                                                <div className="mt-1 max-w-[280px] truncate text-xs text-muted-foreground">
                                                    {proj.role}
                                                </div>
                                            </td>
                                            <td className="max-w-[200px] truncate p-4 font-medium text-foreground">
                                                {proj.subtitle}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {proj.project_folder ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-500/20 bg-green-50/50 text-xs text-green-600 dark:bg-green-950/10 dark:text-green-400"
                                                    >
                                                        {proj.project_folder} (
                                                        {proj.images_count})
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        No screenshots
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            openEditModal(proj)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                proj.id,
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
                </div>
            </div>

            {/* CRUD Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-sidebar-border bg-sidebar text-sidebar-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {editId ? 'Edit Project' : 'Create Project'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Project Title */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="title"
                                    className="text-foreground"
                                >
                                    Project Title
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                    placeholder="Hospital Management SaaS"
                                    className="border-input bg-background text-foreground"
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Subtitle / Category */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="subtitle"
                                    className="text-foreground"
                                >
                                    Subtitle / Platform Category
                                </Label>
                                <Input
                                    id="subtitle"
                                    value={data.subtitle}
                                    onChange={(e) =>
                                        setData('subtitle', e.target.value)
                                    }
                                    required
                                    placeholder="Multi-tenant Healthcare Platform"
                                    className="border-input bg-background text-foreground"
                                />
                                <InputError message={errors.subtitle} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Developer Role */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="role"
                                    className="text-foreground"
                                >
                                    My Role
                                </Label>
                                <Input
                                    id="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData('role', e.target.value)
                                    }
                                    required
                                    placeholder="Team Lead (Full Stack)"
                                    className="border-input bg-background text-foreground"
                                />
                                <InputError message={errors.role} />
                            </div>

                            {/* Main Web Link */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="link"
                                    className="text-foreground"
                                >
                                    Main Website URL
                                </Label>
                                <Input
                                    id="link"
                                    value={data.link}
                                    onChange={(e) =>
                                        setData('link', e.target.value)
                                    }
                                    placeholder="https://clinic.jaipurjoints.com"
                                    className="border-input bg-background text-foreground"
                                />
                                <InputError message={errors.link} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Portfolio screenshots folder */}
                            <div className="col-span-2 grid gap-2">
                                <Label
                                    htmlFor="project_folder"
                                    className="text-foreground"
                                >
                                    Screenshot Folder Name
                                </Label>
                                <Input
                                    id="project_folder"
                                    value={data.project_folder}
                                    onChange={(e) =>
                                        setData(
                                            'project_folder',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="hospital-management-saas"
                                    className="border-input bg-background text-foreground"
                                    readOnly={editId !== null}
                                    disabled={editId !== null}
                                />
                                <InputError message={errors.project_folder} />
                                {editId !== null && (
                                    <p className="text-[10px] text-muted-foreground">
                                        Screenshot folder name cannot be changed
                                        once created.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Project Screenshots Upload & Gallery */}
                        <div className="space-y-4 border-t border-sidebar-border/30 pt-4">
                            <h3 className="text-sm font-semibold text-foreground">
                                Project Screenshots & Gallery
                            </h3>

                            {/* File Upload Input */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="new_images"
                                    className="text-foreground"
                                >
                                    Upload New Screenshots
                                </Label>
                                <Input
                                    id="new_images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const filesArray = Array.from(
                                                e.target.files,
                                            );
                                            setData('new_images', filesArray);

                                            newPreviews.forEach(
                                                URL.revokeObjectURL,
                                            );
                                            const previews = filesArray.map(
                                                (file) =>
                                                    URL.createObjectURL(file),
                                            );
                                            setNewPreviews(previews);
                                        }
                                    }}
                                    className="cursor-pointer border-input bg-background text-foreground"
                                />
                                <InputError message={errors.new_images} />
                                {newPreviews.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <Label className="text-xs font-semibold text-foreground">
                                            New Selected Screenshots Preview
                                        </Label>
                                        <div className="grid max-h-[160px] grid-cols-4 gap-2 overflow-y-auto rounded border border-sidebar-border/40 bg-muted/5 p-2">
                                            {newPreviews.map((path, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group relative flex items-center justify-center overflow-hidden rounded border border-sidebar-border bg-muted/10 p-1"
                                                >
                                                    <img
                                                        src={getFullUrl(path)}
                                                        alt={`New Preview ${idx + 1}`}
                                                        className="h-12 w-auto rounded object-contain"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {data.new_images &&
                                    data.new_images.length > 0 && (
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            Selected {data.new_images.length}{' '}
                                            images to upload on save.
                                        </p>
                                    )}
                            </div>

                            {/* Existing screenshots grid */}
                            {editId !== null && (
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Existing Screenshots (Mark main
                                        thumbnail or delete)
                                    </Label>

                                    {(() => {
                                        const selectedProject = projects.find(
                                            (p) => p.id === editId,
                                        );
                                        const activeScreenshots =
                                            selectedProject
                                                ? (
                                                      selectedProject.screenshots ||
                                                      []
                                                  ).filter(
                                                      (s) =>
                                                          !data.deleted_images.includes(
                                                              s,
                                                          ),
                                                  )
                                                : [];

                                        if (activeScreenshots.length === 0) {
                                            return (
                                                <p className="rounded bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                                                    No screenshots uploaded yet.
                                                </p>
                                            );
                                        }

                                        return (
                                            <div className="grid grid-cols-3 gap-3">
                                                {activeScreenshots.map(
                                                    (path) => {
                                                        const isThumbnail =
                                                            data.image_path ===
                                                            path;

                                                        return (
                                                            <div
                                                                key={path}
                                                                className={`group relative flex flex-col items-center overflow-hidden rounded border bg-muted/10 p-1.5 ${isThumbnail ? 'border-primary' : 'border-sidebar-border'}`}
                                                            >
                                                                <img
                                                                    src={getFullUrl(
                                                                        path,
                                                                    )}
                                                                    alt="Screenshot"
                                                                    className="h-16 w-auto rounded object-contain"
                                                                />
                                                                <div className="mt-2 flex w-full items-center justify-between gap-2 px-1 text-[10px]">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setData(
                                                                                'image_path',
                                                                                path,
                                                                            )
                                                                        }
                                                                        className={`flex-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${isThumbnail ? 'border border-primary/30 bg-primary/20 text-primary' : 'border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                                                    >
                                                                        {isThumbnail
                                                                            ? 'Thumbnail'
                                                                            : 'Set Main'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setData(
                                                                                'deleted_images',
                                                                                [
                                                                                    ...data.deleted_images,
                                                                                    path,
                                                                                ],
                                                                            )
                                                                        }
                                                                        className="rounded border border-transparent p-0.5 text-red-500 hover:border-red-500/20 hover:text-red-700"
                                                                        title="Delete Screenshot"
                                                                    >
                                                                        <Trash className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 items-center gap-4">
                            {/* Sort Order */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="sort_order"
                                    className="text-foreground"
                                >
                                    Sort Order
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData(
                                            'sort_order',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    required
                                    placeholder="1"
                                    className="border-input bg-background text-foreground"
                                />
                                <InputError message={errors.sort_order} />
                            </div>

                            {/* Featured Toggle */}
                            <div className="mt-6 flex items-center gap-2">
                                <input
                                    id="is_featured"
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) =>
                                        setData('is_featured', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                                />
                                <Label
                                    htmlFor="is_featured"
                                    className="cursor-pointer font-medium text-foreground"
                                >
                                    Feature on Home Page Slider
                                </Label>
                                <InputError message={errors.is_featured} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="description"
                                className="text-foreground"
                            >
                                Summary & Contributions
                            </Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                required
                                placeholder="Describe engineering milestones, tech stack used, and direct outcomes..."
                                rows={3}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Dynamic list editor for additional client sublinks */}
                        <div className="mt-2 space-y-2 border-t border-sidebar-border/40 pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold text-foreground">
                                    Additional Client Sub-Links
                                </Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addLinkRow}
                                    className="h-7 border-input bg-background text-xs text-foreground"
                                >
                                    <Plus className="mr-1 h-3 w-3" /> Add Link
                                </Button>
                            </div>

                            <div className="max-h-[160px] space-y-2 overflow-y-auto pr-1">
                                {(data.links_additional || []).length === 0 ? (
                                    <p className="rounded border border-dashed border-sidebar-border bg-muted/20 py-2 text-center text-xs text-muted-foreground">
                                        No additional client sublinks.
                                    </p>
                                ) : (
                                    (data.links_additional || []).map(
                                        (row, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2"
                                            >
                                                <Input
                                                    value={row.title}
                                                    onChange={(e) =>
                                                        updateLinkRow(
                                                            idx,
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Link Label (e.g. BreathClinic)"
                                                    required
                                                    className="h-8 flex-1 border-input bg-background text-xs text-foreground"
                                                />
                                                <Input
                                                    value={row.url}
                                                    onChange={(e) =>
                                                        updateLinkRow(
                                                            idx,
                                                            'url',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://..."
                                                    required
                                                    className="h-8 flex-[2] border-input bg-background text-xs text-foreground"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        removeLinkRow(idx)
                                                    }
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </div>

                        <DialogFooter className="border-t border-sidebar-border/50 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="border-input bg-background text-foreground"
                            >
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
            title: 'Portfolio Projects',
            href: '/dashboard/projects',
        },
    ],
};
