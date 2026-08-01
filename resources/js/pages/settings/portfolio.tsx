import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageProps = {
    siteSettings: {
        site_name: string;
        site_logo: string | null;
        site_favicon: string | null;
        site_meta_title: string | null;
        site_meta_description: string | null;
        owner_name: string | null;
        owner_title: string | null;
        owner_bio_short: string | null;
        owner_bio_long: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        contact_location: string | null;
        contact_address: string | null;
        google_map_link: string | null;
        total_experience: string | null;

        cv_file_path: string | null;
        social_links: Array<{
            icon: string;
            name: string;
            url: string;
            sort_order: number;
        }>;
    };
};

export default function Portfolio({ siteSettings }: PageProps) {
    const { asset_url } = usePage<any>().props;

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (logoPreview) URL.revokeObjectURL(logoPreview);
            if (faviconPreview) URL.revokeObjectURL(faviconPreview);
        };
    }, [logoPreview, faviconPreview]);

    const { data, setData, post, processing, errors } = useForm({
        // Basic App Assets
        site_name: siteSettings.site_name || '',
        site_logo: null as File | null,
        site_favicon: null as File | null,

        // Site Metadata
        site_meta_title: siteSettings.site_meta_title || '',
        site_meta_description: siteSettings.site_meta_description || '',

        // Owner Profile & Bios
        owner_name: siteSettings.owner_name || '',
        owner_title: siteSettings.owner_title || '',
        owner_bio_short: siteSettings.owner_bio_short || '',
        owner_bio_long: siteSettings.owner_bio_long || '',

        total_experience: siteSettings.total_experience || '',
        cv_file_path: null as File | null,

        // Contact Info
        contact_email: siteSettings.contact_email || '',
        contact_phone: siteSettings.contact_phone || '',
        contact_location: siteSettings.contact_location || '',
        contact_address: siteSettings.contact_address || '',
        google_map_link: siteSettings.google_map_link || '',

        // Social Links
        social_links: siteSettings.social_links || [] as Array<{
            icon: string;
            name: string;
            url: string;
            sort_order: number;
        }>,
    });

    const getFullUrl = (path: string | null) => {
        if (!path) {
            return '';
        }

        if (path.startsWith('http')) {
            return path;
        }

        return `${asset_url.replace(/\/$/, '')}${path}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ProfileController.updatePortfolio().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Frontend Configuration" />

            <h1 className="sr-only">Frontend Configuration</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Frontend Configuration"
                    description="Configure site assets, metadata details, developer timelines, contact options, and social profiles."
                />

                <form onSubmit={handleSubmit} className="space-y-8 max-w-xl pb-16">
                    {/* SUBSECTION 1: Website Name & Brand Assets */}
                    <div className="space-y-4 border-b border-sidebar-border/40 pb-6">
                        <h3 className="text-sm font-semibold text-foreground">Site Branding & Assets</h3>

                        {/* Site Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="site_name">Website Name</Label>
                            <Input
                                id="site_name"
                                value={data.site_name}
                                onChange={(e) => setData('site_name', e.target.value)}
                                placeholder="My Portfolio Website"
                            />
                            <InputError message={errors.site_name} />
                        </div>

                        {/* Site Logo */}
                        <div className="grid gap-2">
                            <Label htmlFor="site_logo">Website Logo</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.site_logo && (
                                    <div className="h-14 w-28 bg-muted rounded border border-sidebar-border/70 flex flex-col items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={getFullUrl(siteSettings.site_logo)} 
                                            alt="Current Logo" 
                                            className="h-10 w-auto object-contain"
                                        />
                                        <span className="text-[8px] text-muted-foreground mt-1">Current</span>
                                    </div>
                                )}
                                {logoPreview && (
                                    <div className="h-14 w-28 bg-muted rounded border border-primary/40 flex flex-col items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={logoPreview} 
                                            alt="New Logo Preview" 
                                            className="h-10 w-auto object-contain"
                                        />
                                        <span className="text-[8px] text-primary mt-1">Preview</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="site_logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('site_logo', file);
                                            if (logoPreview) URL.revokeObjectURL(logoPreview);
                                            if (file) {
                                                setLogoPreview(URL.createObjectURL(file));
                                            } else {
                                                setLogoPreview(null);
                                            }
                                        }}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Transparent PNG/SVG recommended. Max 2MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.site_logo} />
                        </div>

                        {/* Site Favicon */}
                        <div className="grid gap-2">
                            <Label htmlFor="site_favicon">Website Favicon</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.site_favicon && (
                                    <div className="h-12 w-12 bg-muted rounded border border-sidebar-border/70 flex flex-col items-center justify-center p-1 flex-shrink-0">
                                        <img 
                                            src={getFullUrl(siteSettings.site_favicon)} 
                                            alt="Current Favicon" 
                                            className="h-6 w-6 object-contain"
                                        />
                                        <span className="text-[8px] text-muted-foreground mt-1">Current</span>
                                    </div>
                                )}
                                {faviconPreview && (
                                    <div className="h-12 w-12 bg-muted rounded border border-primary/40 flex flex-col items-center justify-center p-1 flex-shrink-0">
                                        <img 
                                            src={faviconPreview} 
                                            alt="New Favicon Preview" 
                                            className="h-6 w-6 object-contain"
                                        />
                                        <span className="text-[8px] text-primary mt-1">Preview</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="site_favicon"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('site_favicon', file);
                                            if (faviconPreview) URL.revokeObjectURL(faviconPreview);
                                            if (file) {
                                                setFaviconPreview(URL.createObjectURL(file));
                                            } else {
                                                setFaviconPreview(null);
                                            }
                                        }}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Small square icon (16x16px or 32x32px). Max 1MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.site_favicon} />
                        </div>
                    </div>

                    {/* SUBSECTION 2: SEO Meta Tags */}
                    <div className="space-y-4 border-b border-sidebar-border/40 pb-6">
                        <h3 className="text-sm font-semibold text-foreground">SEO Metadata</h3>

                        {/* Meta Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="site_meta_title">Meta Title Tag</Label>
                            <Input
                                id="site_meta_title"
                                value={data.site_meta_title}
                                onChange={(e) => setData('site_meta_title', e.target.value)}
                                placeholder="Saurabh Sharma | Senior Software Engineer"
                            />
                            <InputError message={errors.site_meta_title} />
                        </div>

                        {/* Meta Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="site_meta_description">Meta Description Tag</Label>
                            <textarea
                                id="site_meta_description"
                                value={data.site_meta_description}
                                onChange={(e) => setData('site_meta_description', e.target.value)}
                                placeholder="SEO description tag..."
                                rows={2}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            />
                            <InputError message={errors.site_meta_description} />
                        </div>
                    </div>

                    {/* SUBSECTION 3: Developer Info */}
                    <div className="space-y-4 border-b border-sidebar-border/40 pb-6">
                        <h3 className="text-sm font-semibold text-foreground">Owner Professional Info</h3>

                        {/* Owner Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="owner_name">Professional Name</Label>
                            <Input
                                id="owner_name"
                                value={data.owner_name}
                                onChange={(e) => setData('owner_name', e.target.value)}
                                placeholder="Saurabh Sharma"
                            />
                            <InputError message={errors.owner_name} />
                        </div>

                        {/* Owner Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="owner_title">Professional Title</Label>
                            <Input
                                id="owner_title"
                                value={data.owner_title}
                                onChange={(e) => setData('owner_title', e.target.value)}
                                placeholder="Senior Software Engineer"
                            />
                            <InputError message={errors.owner_title} />
                        </div>

                        {/* Experience Years */}
                        <div className="grid gap-2">
                            <Label htmlFor="total_experience">Total Experience (e.g. 8+)</Label>
                            <Input
                                id="total_experience"
                                value={data.total_experience}
                                onChange={(e) => setData('total_experience', e.target.value)}
                                placeholder="8+"
                            />
                            <InputError message={errors.total_experience} />
                        </div>

                        {/* CV PDF Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="cv_file_path">Resume/CV PDF File</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.cv_file_path && (
                                    <div className="text-xs bg-muted px-3 py-1.5 rounded border border-sidebar-border flex items-center gap-1.5 text-muted-foreground">
                                        CV Uploaded
                                        <a href={getFullUrl(siteSettings.cv_file_path)} target="_blank" className="text-blue-500 underline ml-2">View</a>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="cv_file_path"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setData('cv_file_path', e.target.files?.[0] || null)}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">PDF document only. Max 10MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.cv_file_path} />
                        </div>

                        {/* Short Biography */}
                        <div className="grid gap-2">
                            <Label htmlFor="owner_bio_short">Short Intro Paragraph</Label>
                            <textarea
                                id="owner_bio_short"
                                value={data.owner_bio_short}
                                onChange={(e) => setData('owner_bio_short', e.target.value)}
                                placeholder="Brief intro displayed under the main hero..."
                                rows={2}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            />
                            <InputError message={errors.owner_bio_short} />
                        </div>

                        {/* Long Biography */}
                        <div className="grid gap-2">
                            <Label htmlFor="owner_bio_long">Main Profile Description</Label>
                            <textarea
                                id="owner_bio_long"
                                value={data.owner_bio_long}
                                onChange={(e) => setData('owner_bio_long', e.target.value)}
                                placeholder="Full developer details..."
                                rows={4}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            />
                            <InputError message={errors.owner_bio_long} />
                        </div>


                    </div>

                    {/* SUBSECTION 4: Contact details */}
                    <div className="space-y-4 border-b border-sidebar-border/40 pb-6">
                        <h3 className="text-sm font-semibold text-foreground">Contact details</h3>

                        {/* Contact Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="contact_email">Public Contact Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={data.contact_email}
                                onChange={(e) => setData('contact_email', e.target.value)}
                                placeholder="saurabh.ss957@gmail.com"
                            />
                            <InputError message={errors.contact_email} />
                        </div>

                        {/* Contact Phone */}
                        <div className="grid gap-2">
                            <Label htmlFor="contact_phone">Contact Phone Number</Label>
                            <Input
                                id="contact_phone"
                                value={data.contact_phone}
                                onChange={(e) => setData('contact_phone', e.target.value)}
                                placeholder="+91-7014182012"
                            />
                            <InputError message={errors.contact_phone} />
                        </div>

                        {/* Contact Location */}
                        <div className="grid gap-2">
                            <Label htmlFor="contact_location">City/State Location</Label>
                            <Input
                                id="contact_location"
                                value={data.contact_location}
                                onChange={(e) => setData('contact_location', e.target.value)}
                                placeholder="Jaipur, Rajasthan"
                            />
                            <InputError message={errors.contact_location} />
                        </div>

                        {/* Contact Address */}
                        <div className="grid gap-2">
                            <Label htmlFor="contact_address">Full Contact Address</Label>
                            <Input
                                id="contact_address"
                                value={data.contact_address}
                                onChange={(e) => setData('contact_address', e.target.value)}
                                placeholder="Jaipur, Rajasthan, India"
                            />
                            <InputError message={errors.contact_address} />
                        </div>

                        {/* Google Map Link */}
                        <div className="grid gap-2">
                            <Label htmlFor="google_map_link">Google Maps Location URL</Label>
                            <Input
                                id="google_map_link"
                                value={data.google_map_link}
                                onChange={(e) => setData('google_map_link', e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                            />
                            <InputError message={errors.google_map_link} />
                        </div>
                    </div>

                    {/* SUBSECTION 5: Social Profiles */}
                    <div className="space-y-6 border-b border-sidebar-border/40 pb-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Social Links & Profiles</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const nextOrder = data.social_links.length > 0 
                                        ? Math.max(...data.social_links.map(l => l.sort_order)) + 1 
                                        : 1;
                                    setData('social_links', [
                                        ...data.social_links,
                                        { icon: '', name: '', url: '', sort_order: nextOrder }
                                    ]);
                                }}
                                className="h-8 text-xs flex items-center gap-1.5"
                            >
                                Add Social Link
                            </Button>
                        </div>

                        {data.social_links.length === 0 ? (
                            <p className="text-xs text-muted-foreground bg-muted/20 p-4 rounded text-center">No social profiles configured yet. Click "Add Social Link" above to add one.</p>
                        ) : (
                            <div className="space-y-4">
                                {data.social_links.map((link, index) => (
                                    <div key={index} className="p-4 rounded border border-sidebar-border/50 bg-muted/5 relative space-y-3">
                                        <div className="flex items-center justify-between border-b border-sidebar-border/30 pb-2">
                                            <span className="text-xs font-semibold text-muted-foreground">Social Profile #{index + 1}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = [...data.social_links];
                                                    updated.splice(index, 1);
                                                    setData('social_links', updated);
                                                }}
                                                className="h-6 text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-[10px]"
                                            >
                                                Remove
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Display Name */}
                                            <div className="grid gap-1">
                                                <Label className="text-[10px] text-muted-foreground">Display Name (e.g. LinkedIn)</Label>
                                                <Input
                                                    value={link.name}
                                                    onChange={(e) => {
                                                        const updated = [...data.social_links];
                                                        updated[index] = { ...updated[index], name: e.target.value };
                                                        setData('social_links', updated);
                                                    }}
                                                    placeholder="LinkedIn"
                                                    required
                                                    className="h-8 text-xs bg-background border-input text-foreground"
                                                />
                                                <InputError message={errors[`social_links.${index}.name` as any]} />
                                            </div>

                                            {/* Sort Order */}
                                            <div className="grid gap-1">
                                                <Label className="text-[10px] text-muted-foreground">Sort Order</Label>
                                                <Input
                                                    type="number"
                                                    value={link.sort_order}
                                                    onChange={(e) => {
                                                        const updated = [...data.social_links];
                                                        updated[index] = { ...updated[index], sort_order: parseInt(e.target.value) || 0 };
                                                        setData('social_links', updated);
                                                    }}
                                                    placeholder="1"
                                                    required
                                                    className="h-8 text-xs bg-background border-input text-foreground"
                                                />
                                                <InputError message={errors[`social_links.${index}.sort_order` as any]} />
                                            </div>
                                        </div>

                                        {/* URL Hyperlink */}
                                        <div className="grid gap-1">
                                            <Label className="text-[10px] text-muted-foreground">Profile Hyperlink URL</Label>
                                            <Input
                                                value={link.url}
                                                onChange={(e) => {
                                                    const updated = [...data.social_links];
                                                    updated[index] = { ...updated[index], url: e.target.value };
                                                    setData('social_links', updated);
                                                }}
                                                placeholder="https://www.linkedin.com/in/..."
                                                required
                                                className="h-8 text-xs bg-background border-input text-foreground"
                                            />
                                            <InputError message={errors[`social_links.${index}.url` as any]} />
                                        </div>

                                        {/* File (Icon Upload) */}
                                        <div className="grid gap-1.5 border-t border-sidebar-border/20 pt-2">
                                            <Label className="text-[10px] text-muted-foreground">Icon File (SVG, PNG, JPG)</Label>
                                            <div className="flex items-center gap-3">
                                                {link.icon ? (
                                                    (link.icon.startsWith('/') || link.icon.startsWith('http') || link.icon.startsWith('blob:')) ? (
                                                        <div className="h-8 w-8 bg-muted rounded border border-sidebar-border flex items-center justify-center p-1.5 flex-shrink-0">
                                                            <img 
                                                                src={getFullUrl(link.icon)} 
                                                                alt="Icon Preview" 
                                                                className="h-full w-full object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-8 px-2 bg-primary/10 text-primary border border-primary/20 rounded flex items-center justify-center flex-shrink-0">
                                                            <span className="text-[9px] uppercase font-bold tracking-wider">{link.icon}</span>
                                                        </div>
                                                    )
                                                ) : null}
                                                <div className="flex-1">
                                                    <Input
                                                        type="file"
                                                        accept=".svg,.png,.jpg,.jpeg,.webp"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            const updated = [...data.social_links];
                                                            // Temporarily append the File object to the row state
                                                            (updated[index] as any).icon_file = file;
                                                            
                                                            // Create a temporary object URL for instant preview in the UI
                                                            if (file) {
                                                                updated[index].icon = URL.createObjectURL(file);
                                                            }
                                                            setData('social_links', updated);
                                                        }}
                                                        className="h-8 text-[10px] bg-background border-input cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <InputError message={errors[`social_links.${index}.icon_file` as any]} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* Submit Button */}
                    <div className="flex items-center gap-4 border-t border-sidebar-border/50 pt-6">
                        <Button disabled={processing}>
                            {processing ? 'Saving...' : 'Save Website Configurations'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Portfolio.layout = {
    breadcrumbs: [
        {
            title: 'Frontend Configuration',
            href: '/settings/portfolio',
        },
    ],
};
