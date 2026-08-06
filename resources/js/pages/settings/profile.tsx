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
        };
    };
    mustVerifyEmail: boolean;
    status?: string;
    adminSettings: {
        admin_logo: string | null;
        admin_icon: string | null;
    };
};

export default function Profile({
    mustVerifyEmail,
    status,
    adminSettings,
}: PageProps) {
    const { auth, asset_url } = usePage<any>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        bio: auth.user.bio || '',
        avatar: null as File | null,
        admin_logo: null as File | null,
        admin_icon: null as File | null,
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
        post(ProfileController.update().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Backend Configuration" />

            <h1 className="sr-only">Backend Configuration</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Backend Configuration"
                    description="Update your personal account details, avatar, and contact bio information."
                />

                <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                    {/* Avatar Upload */}
                    <div className="grid gap-2">
                        <Label htmlFor="avatar">Profile Avatar</Label>
                        <div className="mt-1 flex items-center gap-4">
                            {auth.user.avatar && (
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-sidebar-border/70">
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
                                    onChange={(e) =>
                                        setData(
                                            'avatar',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="max-w-xs"
                                />
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                    Square image, recommended 150x150px. Max
                                    2MB.
                                </p>
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
                            className="w-full rounded-md border border-input bg-background p-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <InputError message={errors.bio} />
                    </div>

                    {mustVerifyEmail &&
                        auth.user.email_verified_at === null && (
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                                <p className="text-xs text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to re-send verification
                                        email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-xs font-medium text-green-600">
                                        A new verification link has been sent to
                                        your email address.
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Dashboard Branding */}
                    <div className="mt-6 space-y-4 border-t border-sidebar-border/50 pt-6">
                        <h3 className="text-sm font-semibold text-foreground">
                            Dashboard Branding
                        </h3>

                        {/* Admin Logo */}
                        <div className="grid gap-2">
                            <Label htmlFor="admin_logo">
                                Admin Dashboard Logo
                            </Label>
                            <div className="mt-1 flex items-center gap-4">
                                {adminSettings?.admin_logo && (
                                    <div className="flex h-12 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-sidebar-border/70 bg-muted p-2">
                                        <img
                                            src={getFullUrl(
                                                adminSettings.admin_logo,
                                            )}
                                            alt="Current Admin Logo"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="admin_logo"
                                        type="file"
                                        accept=".svg,.png,.jpg,.jpeg,.webp"
                                        onChange={(e) =>
                                            setData(
                                                'admin_logo',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        Max 2MB. SVG, PNG, JPG, WebP supported.
                                    </p>
                                </div>
                            </div>
                            <InputError message={errors.admin_logo} />
                        </div>

                        {/* Admin Icon */}
                        <div className="grid gap-2">
                            <Label htmlFor="admin_icon">
                                Admin Dashboard Icon
                            </Label>
                            <div className="mt-1 flex items-center gap-4">
                                {adminSettings?.admin_icon && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-sidebar-border/70 bg-muted p-1">
                                        <img
                                            src={getFullUrl(
                                                adminSettings.admin_icon,
                                            )}
                                            alt="Current Admin Icon"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="admin_icon"
                                        type="file"
                                        accept=".svg,.png,.jpg,.jpeg,.webp"
                                        onChange={(e) =>
                                            setData(
                                                'admin_icon',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        Square image (e.g. 32x32px). Max 1MB.
                                        SVG, PNG, JPG, WebP supported.
                                    </p>
                                </div>
                            </div>
                            <InputError message={errors.admin_icon} />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 border-t border-sidebar-border/50 pt-6">
                        <Button disabled={processing}>
                            {processing ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-12 max-w-xl border-t border-sidebar-border/50 pt-8">
                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Backend Configuration',
            href: edit(),
        },
    ],
};
