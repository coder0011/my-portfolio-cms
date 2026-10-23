/**
 * High-Performance Markdown & HTML Bidirectional Processing Engine
 * Powered by Marked for GFM (Tables, Task Lists, Blockquotes, Fenced Code Blocks)
 */
import { marked } from 'marked';

// Configure marked with GFM options
marked.setOptions({
    gfm: true,
    breaks: true,
});

export interface ParsedDocument {
    frontmatter: Record<string, any>;
    rawFrontmatter: string;
    body: string;
}

/**
 * Extracts YAML frontmatter and returns clean body
 */
export function extractFrontmatter(markdown: string): ParsedDocument {
    if (!markdown) {
        return { frontmatter: {}, rawFrontmatter: '', body: '' };
    }

    const trimmed = markdown.trim();
    const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

    if (!match) {
        return { frontmatter: {}, rawFrontmatter: '', body: trimmed };
    }

    const rawFrontmatter = match[1] || '';
    const body = (match[2] || '').trim();
    const frontmatter: Record<string, any> = {};

    // Key-value YAML parser
    rawFrontmatter.split(/\r?\n/).forEach((line) => {
        const colonIdx = line.indexOf(':');

        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();

            // Unquote strings
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            } else if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    value = JSON.parse(value);
                } catch {
                    // ignore JSON parse error
                }
            }

            frontmatter[key] = value;
        }
    });

    return { frontmatter, rawFrontmatter, body };
}

/**
 * Re-attaches frontmatter to body markdown
 */
export function attachFrontmatter(
    body: string,
    rawFrontmatter: string,
): string {
    if (!rawFrontmatter.trim()) {
        return body.trim();
    }

    return `---\n${rawFrontmatter.trim()}\n---\n\n${body.trim()}`;
}

/**
 * Converts Markdown string into clean, semantic HTML for TipTap and Visual rendering
 */
export function markdownToHtml(markdown: string): string {
    if (!markdown) {
        return '<p></p>';
    }

    // Strip frontmatter before rendering body HTML
    const { body } = extractFrontmatter(markdown);

    if (!body) {
        return '<p></p>';
    }

    try {
        const html = marked.parse(body) as string;

        return html;
    } catch (err) {
        console.error('[markdownToHtml] Marked parse failed:', err);

        return `<p>${escapeHtml(body)}</p>`;
    }
}

/**
 * Converts TipTap HTML back to clean GFM Markdown
 */
export function htmlToMarkdown(html: string): string {
    if (!html || html === '<p></p>' || html === '<p><br></p>') {
        return '';
    }

    let md = html;

    // 1. Pre/Code Blocks (protect from other replacements)
    const codeBlocks: string[] = [];
    md = md.replace(
        /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/gi,
        (_, lang, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            const cleanCode = code
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .trim();
            codeBlocks.push(`\`\`\`${lang || ''}\n${cleanCode}\n\`\`\``);

            return `\n\n${placeholder}\n\n`;
        },
    );

    // 2. Tables
    md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
        const rows: string[] = [];
        const trMatches =
            tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

        trMatches.forEach((tr: string, i: number) => {
            const cells = (
                tr.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || []
            ).map((c: string) => {
                return c.replace(/<[^>]+>/g, '').trim();
            });

            if (cells.length > 0) {
                rows.push(`| ${cells.join(' | ')} |`);

                if (i === 0) {
                    rows.push(`| ${cells.map(() => ':---').join(' | ')} |`);
                }
            }
        });

        return rows.length > 0 ? `\n\n${rows.join('\n')}\n\n` : '';
    });

    // 3. Headings
    md = md.replace(/<h1>(.*?)<\/h1>/gi, '\n\n# $1\n\n');
    md = md.replace(/<h2>(.*?)<\/h2>/gi, '\n\n## $1\n\n');
    md = md.replace(/<h3>(.*?)<\/h3>/gi, '\n\n### $1\n\n');
    md = md.replace(/<h4>(.*?)<\/h4>/gi, '\n\n#### $1\n\n');

    // 4. Horizontal Rules
    md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

    // 5. Blockquotes
    md = md.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
        const clean = content
            .replace(/<p>/gi, '')
            .replace(/<\/p>/gi, '\n')
            .trim()
            .split('\n')
            .map((line: string) => `> ${line.trim()}`)
            .join('\n');

        return `\n\n${clean}\n\n`;
    });

    // 6. Lists
    md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, items) => {
        const lis = (items.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map(
            (li: string) => `* ${li.replace(/<[^>]+>/g, '').trim()}`,
        );

        return `\n\n${lis.join('\n')}\n\n`;
    });

    md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, items) => {
        const lis = (items.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []).map(
            (li: string, idx: number) =>
                `${idx + 1}. ${li.replace(/<[^>]+>/g, '').trim()}`,
        );

        return `\n\n${lis.join('\n')}\n\n`;
    });

    // 7. Inline Formatting
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(
        /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
        '[$2]($1)',
    );

    // 8. Paragraphs
    md = md.replace(/<p>(.*?)<\/p>/gi, '\n\n$1\n\n');

    // 9. Strip all remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');

    // 10. Restore code blocks
    codeBlocks.forEach((block, idx) => {
        md = md.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    // 11. Decode HTML entities
    md = md
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return md;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
