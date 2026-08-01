import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function resolveUrl(path: string): string {
    if (!path) return path;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const match = pathname.match(/^(\/[^\/]+\/public)/);
        if (match && !path.startsWith(match[1])) {
            return `${match[1]}${path.startsWith('/') ? '' : '/'}${path}`;
        }
    }
    return path;
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    const raw = typeof url === 'string' ? url : url.url;
    return resolveUrl(raw);
}
