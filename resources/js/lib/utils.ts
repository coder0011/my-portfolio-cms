import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function resolveUrl(path: string): string {
    if (!path) {
        return path;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (typeof window !== 'undefined') {
        // Guard against duplicate host in path (e.g. /my-portfolio-cms.local/dashboard -> /dashboard)
        if (window.location.host && path.startsWith(`/${window.location.host}/`)) {
            path = path.slice(window.location.host.length + 1);
        } else if (window.location.host && path === `/${window.location.host}`) {
            path = '/';
        }

        const pathname = window.location.pathname;
        const match = pathname.match(/^(\/[^/]+\/public)/);

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

export async function postJson<T = any>(
    url: string,
    data: Record<string, any>,
): Promise<T> {
    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));
    const token = xsrfCookie
        ? decodeURIComponent(xsrfCookie.split('=')[1])
        : '';

    const res = await fetch(resolveUrl(url), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.message || 'API request failed');
    }

    return json;
}

/**
 * Modern ECMAScript groupBy helper using Object.groupBy (ES2024) with graceful fallback
 */
export function groupBy<T, K extends PropertyKey>(
    items: readonly T[],
    keyFn: (item: T) => K,
): Partial<Record<K, T[]>> {
    if (typeof (Object as any).groupBy === 'function') {
        return (Object as any).groupBy(items, keyFn);
    }

    return items.reduce(
        (acc, item) => {
            const key = keyFn(item);

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key]!.push(item);

            return acc;
        },
        {} as Partial<Record<K, T[]>>,
    );
}

/**
 * Modern non-mutating sort helper using toSorted (ES2023) with fallback
 */
export function sortBy<T>(
    items: readonly T[],
    keyFn: (item: T) => number | string,
    direction: 'asc' | 'desc' = 'asc',
): T[] {
    const compare = (a: T, b: T) => {
        const valA = keyFn(a);
        const valB = keyFn(b);

        if (valA < valB) {
            return direction === 'asc' ? -1 : 1;
        }

        if (valA > valB) {
            return direction === 'asc' ? 1 : -1;
        }

        return 0;
    };

    if (typeof (items as any).toSorted === 'function') {
        return (items as any).toSorted(compare);
    }

    return [...items].sort(compare);
}
