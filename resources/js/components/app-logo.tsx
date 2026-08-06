import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name, siteSettings, asset_url } = usePage<any>().props;

    const getFullUrl = (path: string | null) => {
        if (!path) {
            return '';
        }

        if (path.startsWith('http')) {
            return path;
        }

        return `${asset_url.replace(/\/$/, '')}${path}`;
    };

    const adminLogoUrl = siteSettings?.admin_logo
        ? getFullUrl(siteSettings.admin_logo)
        : null;
    const adminIconUrl = siteSettings?.admin_icon
        ? getFullUrl(siteSettings.admin_icon)
        : null;
    const siteName = siteSettings?.site_name || name;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {adminIconUrl ? (
                    <img
                        src={adminIconUrl}
                        alt="Admin Icon"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                {adminLogoUrl ? (
                    <div className="flex h-6 w-auto max-w-[120px] items-center overflow-hidden">
                        <img
                            src={adminLogoUrl}
                            alt={siteName}
                            className="h-full w-auto object-contain"
                        />
                    </div>
                ) : (
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {siteName}
                    </span>
                )}
            </div>
        </>
    );
}
