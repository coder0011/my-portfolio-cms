import { useMemo } from 'react';

export interface SeoInput {
    title?: string;
    meta_title?: string;
    excerpt?: string;
    meta_description?: string;
    focus_keyword?: string;
    body?: string;
}

export interface SeoAnalysisResult {
    titleLength: number;
    titleStatus: string;
    descLength: number;
    descStatus: string;
    density: number;
    keywordInTitle: boolean;
    keywordInDesc: boolean;
    hasAltTags: boolean;
    score: number;
}

export function useSeoAnalysis(input: SeoInput): SeoAnalysisResult {
    return useMemo(() => {
        const title = input.meta_title || input.title || '';
        const desc = input.meta_description || input.excerpt || '';
        const kw = (input.focus_keyword || '').toLowerCase();
        const body = input.body || '';

        const titleLen = title.length;
        let titleStatus = 'good';

        if (titleLen === 0) {
            titleStatus = 'empty';
        } else if (titleLen < 30) {
            titleStatus = 'too-short';
        } else if (titleLen > 60) {
            titleStatus = 'too-long';
        }

        const descLen = desc.length;
        let descStatus = 'good';

        if (descLen === 0) {
            descStatus = 'empty';
        } else if (descLen < 110) {
            descStatus = 'too-short';
        } else if (descLen > 160) {
            descStatus = 'too-long';
        }

        // Keyword checks
        const keywordInTitle = kw ? title.toLowerCase().includes(kw) : false;
        const keywordInDesc = kw ? desc.toLowerCase().includes(kw) : false;

        // Density check
        let density = 0;

        if (kw && body) {
            const words = body.toLowerCase().split(/\s+/).filter(Boolean);
            const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = body.toLowerCase().match(new RegExp(`\\b${escapedKw}\\b`, 'g'));
            const matchCount = matches ? matches.length : 0;
            density = words.length > 0 ? (matchCount / words.length) * 100 : 0;
        }

        // Check alt tags in body Markdown
        let hasAltTags = true;

        if (body) {
            const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
            let match: RegExpExecArray | null;

            while ((match = imgRegex.exec(body)) !== null) {
                if (!match[1].trim()) {
                    hasAltTags = false;
                    break;
                }
            }
        }

        // Calculate a score out of 100
        let score = 0;

        if (titleStatus === 'good') {
            score += 25;
        }

        if (descStatus === 'good') {
            score += 25;
        }

        if (keywordInTitle) {
            score += 20;
        }

        if (keywordInDesc) {
            score += 15;
        }

        if (density >= 0.5 && density <= 2.5) {
            score += 10;
        }

        if (hasAltTags && body) {
            score += 5;
        }

        return {
            titleLength: titleLen,
            titleStatus,
            descLength: descLen,
            descStatus,
            density,
            keywordInTitle,
            keywordInDesc,
            hasAltTags,
            score,
        };
    }, [input.title, input.meta_title, input.excerpt, input.meta_description, input.focus_keyword, input.body]);
}
