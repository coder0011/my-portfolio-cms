import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth & {
        user: {
            avatar?: string | null;
            bio?: string | null;
        }
    };
    siteSettings: {
        site_name: string;
        site_logo: string | null;
        site_favicon: string | null;
        admin_logo: string | null;
        admin_icon: string | null;
    };
    mustVerifyEmail: boolean;
    status?: string;
};

export default function Profile({ mustVerifyEmail, status, siteSettings }: PageProps) {
    const { auth, asset_url } = usePage<any>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        bio: auth.user.bio || '',
        avatar: null as File | null,
        site_name: siteSettings.site_name || '',
        site_logo: null as File | null,
        site_favicon: null as File | null,
        admin_logo: null as File | null,
        admin_icon: null as File | null,
    });

    const getFullUrl = (path: string | null) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${asset_url.replace(/\/$/, '')}${path}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ProfileController.update().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Profile & Settings" />

            <h1 className="sr-only">Profile & Settings</h1>

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Profile & Application Settings"
                    description="Configure your administrative details and customize logo assets for the frontend and admin panel."
                />

                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                    {/* SECTION 1: User Account Details */}
                    <div className="space-y-6 border-b border-sidebar-border/50 pb-8">
                        <h3 className="text-sm font-semibold text-foreground">User Profile Info</h3>

                        {/* Avatar Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">Profile Avatar</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {auth.user.avatar && (
                                    <div className="h-16 w-16 rounded-full overflow-hidden border border-sidebar-border/70 flex-shrink-0">
                                        <img 
                                            src={getFullUrl(auth.user.avatar)} 
                                            alt="Current Avatar" 
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('avatar', e.target.files?.[0] || null)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Square image, recommended 150x150px. Max 2MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.avatar} />
                        </div>

                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Bio */}
                        <div className="grid gap-2">
                            <Label htmlFor="bio">Profile Biography</Label>
                            <textarea
                                id="bio"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                placeholder="Write a short bio about yourself..."
                                rows={3}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <InputError message={errors.bio} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to re-send verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-xs font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Global Frontend Settings */}
                    <div className="space-y-6 border-b border-sidebar-border/50 pb-8">
                        <h3 className="text-sm font-semibold text-foreground">Site Configuration (Frontend)</h3>

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
                            <Label htmlFor="site_logo">Frontend Website Logo</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.site_logo && (
                                    <div className="h-12 w-28 bg-muted rounded border border-sidebar-border/70 flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={getFullUrl(siteSettings.site_logo)} 
                                            alt="Current Logo" 
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="site_logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('site_logo', e.target.files?.[0] || null)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Transparent PNG/SVG recommended. Max 2MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.site_logo} />
                        </div>

                        {/* Site Favicon */}
                        <div className="grid gap-2">
                            <Label htmlFor="site_favicon">Website Favicon (.ico / .png)</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.site_favicon && (
                                    <div className="h-8 w-8 bg-muted rounded border border-sidebar-border/70 flex items-center justify-center p-1.5 flex-shrink-0">
                                        <img 
                                            src={getFullUrl(siteSettings.site_favicon)} 
                                            alt="Current Favicon" 
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="site_favicon"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('site_favicon', e.target.files?.[0] || null)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Small square icon (16x16px or 32x32px). Max 1MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.site_favicon} />
                        </div>
                    </div>

                    {/* SECTION 3: Admin Customization */}
                    <div className="space-y-6 pb-4">
                        <h3 className="text-sm font-semibold text-foreground">Admin Customization</h3>

                        {/* Admin Logo */}
                        <div className="grid gap-2">
                            <Label htmlFor="admin_logo">Admin Dashboard Logo</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.admin_logo && (
                                    <div className="h-12 w-28 bg-muted rounded border border-sidebar-border/70 flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={getFullUrl(siteSettings.admin_logo)} 
                                            alt="Current Admin Logo" 
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="admin_logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('admin_logo', e.target.files?.[0] || null)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Logo shown at top-left of sidebar/admin views. Max 2MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.admin_logo} />
                        </div>

                        {/* Admin Icon */}
                        <div className="grid gap-2">
                            <Label htmlFor="admin_icon">Admin Icon/Mini-Logo</Label>
                            <div className="flex items-center gap-4 mt-1">
                                {siteSettings.admin_icon && (
                                    <div className="h-8 w-8 bg-muted rounded border border-sidebar-border/70 flex items-center justify-center p-1.5 flex-shrink-0">
                                        <img 
                                            src={getFullUrl(siteSettings.admin_icon)} 
                                            alt="Current Admin Icon" 
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="admin_icon"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('admin_icon', e.target.files?.[0] || null)}
                                        className="max-w-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Mini icon shown when sidebar is collapsed. Max 1MB.</p>
                                </div>
                            </div>
                            <InputError message={errors.admin_icon} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 border-t border-sidebar-border/50 pt-6">
                        <Button disabled={processing}>
                            {processing ? 'Saving changes...' : 'Save All Settings'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-12 pt-8 border-t border-sidebar-border/50 max-w-2xl">
                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
