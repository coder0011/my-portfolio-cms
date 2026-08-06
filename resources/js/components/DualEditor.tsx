import {
    Bold,
    Italic,
    Link,
    Code,
    List,
    Heading as HeadingIcon,
    Eye,
    PenTool,
} from 'lucide-react';
import { marked } from 'marked';
import React, { useState, useRef } from 'react';

interface DualEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
}

export default function DualEditor({
    value,
    onChange,
    placeholder = 'Write content here...',
    rows = 15,
    error,
}: DualEditorProps) {
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Insert markdown formatting at cursor position
    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const replacement = before + (selectedText || 'text') + after;
        const newValue =
            text.substring(0, start) + replacement + text.substring(end);

        onChange(newValue);

        // Reset cursor focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + (selectedText || 'text').length,
            );
        }, 0);
    };

    // Compile Markdown to HTML safely
    const getPreviewHtml = () => {
        try {
            // marked.parse returns string or Promise. We force it to string.
            const parsed = marked.parse(
                value || '_Nothing to preview yet..._',
            ) as string;

            return { __html: parsed };
        } catch {
            return {
                __html: '<p className="text-destructive">Failed to render preview.</p>',
            };
        }
    };

    return (
        <div className="flex flex-col overflow-hidden rounded-md border border-input bg-background">
            {/* Header Tabs & Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-input bg-muted/40 px-3 py-1.5">
                {/* Tabs */}
                <div className="flex items-center gap-1 rounded bg-muted/70 p-0.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === 'write'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <PenTool className="h-3 w-3" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === 'preview'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Eye className="h-3 w-3" />
                        Preview
                    </button>
                </div>

                {/* Toolbar (Only visible on Write mode) */}
                {activeTab === 'write' && (
                    <div className="flex items-center gap-0.5 border-l border-input pl-2 sm:border-0 sm:pl-0">
                        <button
                            type="button"
                            onClick={() => insertMarkdown('**', '**')}
                            title="Bold"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Bold className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('*', '*')}
                            title="Italic"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Italic className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('## ')}
                            title="Heading"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <HeadingIcon className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('[', '](url)')}
                            title="Link"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Link className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('```\n', '\n```')}
                            title="Code Block"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Code className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('- ')}
                            title="List Item"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="relative min-h-[300px]">
                {activeTab === 'write' ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        className="min-h-[300px] w-full resize-y border-0 bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    />
                ) : (
                    <div
                        className="prose dark:prose-invert min-h-[300px] max-w-none overflow-y-auto bg-background p-6 text-sm text-foreground"
                        dangerouslySetInnerHTML={getPreviewHtml()}
                    />
                )}
            </div>

            {error && (
                <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">
                    {error}
                </div>
            )}
        </div>
    );
}
