import {
    Columns2,
    Eye,
    Code2,
    Sparkles,
    Wand2,
    FileText,
    Scissors,
    Loader2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { postJson } from '@/lib/utils';

export type EditorMode = 'dual' | 'visual' | 'markdown';

export interface DualEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
    defaultMode?: EditorMode;
    title?: string;
}

export default function DualEditor({
    value,
    onChange,
    placeholder = 'Start writing your article...',
    error,
    defaultMode = 'dual',
    title = '',
}: DualEditorProps) {
    const [mode, setMode] = useState<EditorMode>(defaultMode);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

    const handleTipTapChange = (markdown: string) => {
        onChange(markdown);
    };

    const handleMarkdownChange = (val: string) => {
        onChange(val);
    };

    const runAiAssist = async (action: 'outline' | 'improve' | 'simplify') => {
        if (isAiLoading) {
            return;
        }

        if (action !== 'outline' && !value.trim()) {
            toast.error(
                'Please write some content first before asking AI to improve or simplify.',
            );

            return;
        }

        setIsAiLoading(true);
        setActiveAiAction(action);

        try {
            const res = await postJson<{ success: boolean; content: string }>(
                '/dashboard/posts/ai/editorial',
                {
                    action,
                    content: value,
                    title,
                },
            );

            if (res.content) {
                onChange(res.content);
                const labels: Record<string, string> = {
                    outline: 'Outline generated',
                    improve: 'Content polished & enhanced',
                    simplify: 'Content simplified (Ponytail Mode)',
                };

                toast.success(labels[action] || 'AI action completed!');
            }
        } catch (err: any) {
            toast.error(err.message || 'AI assistant request failed');
        } finally {
            setIsAiLoading(false);
            setActiveAiAction(null);
        }
    };

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all">
            {/* Studio Navigation & Mode Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2 select-none">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground uppercase">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Editorial Studio
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                            • TipTap & Markdown
                        </span>
                    </div>

                    {/* AI Editorial Tools */}
                    <div className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5">
                        <span className="mr-1 text-[10px] font-semibold tracking-wider text-primary uppercase">
                            AI Assist:
                        </span>

                        <button
                            type="button"
                            disabled={isAiLoading}
                            onClick={() => runAiAssist('outline')}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/10 disabled:opacity-50"
                            title="Generate article outline from title"
                        >
                            {isAiLoading && activeAiAction === 'outline' ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                                <FileText className="h-3 w-3 text-primary" />
                            )}
                            Outline
                        </button>

                        <button
                            type="button"
                            disabled={isAiLoading}
                            onClick={() => runAiAssist('improve')}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/10 disabled:opacity-50"
                            title="Polish, enhance flow and clarity"
                        >
                            {isAiLoading && activeAiAction === 'improve' ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                                <Wand2 className="h-3 w-3 text-primary" />
                            )}
                            Polish
                        </button>

                        <button
                            type="button"
                            disabled={isAiLoading}
                            onClick={() => runAiAssist('simplify')}
                            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/10 disabled:opacity-50"
                            title="Simplify prose (Ponytail Minimalist mode)"
                        >
                            {isAiLoading && activeAiAction === 'simplify' ? (
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            ) : (
                                <Scissors className="h-3 w-3 text-primary" />
                            )}
                            Simplify
                        </button>
                    </div>
                </div>

                {/* 3-Way Mode Switcher */}
                <div className="flex items-center rounded-lg border border-border/60 bg-muted/70 p-0.5">
                    <button
                        type="button"
                        onClick={() => setMode('dual')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                            mode === 'dual'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Side-by-side Split View"
                    >
                        <Columns2 className="h-3.5 w-3.5" />
                        <span>Dual</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('visual')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                            mode === 'visual'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Visual WYSIWYG Mode"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Visual</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('markdown')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                            mode === 'markdown'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Raw Markdown Code Mode"
                    >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Markdown</span>
                    </button>
                </div>
            </div>

            {/* Editor Canvas Area */}
            <div className="relative min-h-[420px]">
                {mode === 'dual' && (
                    <div className="grid min-h-[420px] grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                        <div className="flex flex-col overflow-hidden">
                            <TipTapEditor
                                content={value}
                                onChange={handleTipTapChange}
                                placeholder={placeholder}
                                minHeight="min-h-[420px]"
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <MarkdownEditor
                                value={value}
                                onChange={handleMarkdownChange}
                                placeholder={placeholder}
                                minHeight="min-h-[420px]"
                            />
                        </div>
                    </div>
                )}

                {mode === 'visual' && (
                    <div className="min-h-[420px]">
                        <TipTapEditor
                            content={value}
                            onChange={handleTipTapChange}
                            placeholder={placeholder}
                            minHeight="min-h-[420px]"
                        />
                    </div>
                )}

                {mode === 'markdown' && (
                    <div className="min-h-[420px]">
                        <MarkdownEditor
                            value={value}
                            onChange={handleMarkdownChange}
                            placeholder={placeholder}
                            minHeight="min-h-[420px]"
                        />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
                    {error}
                </div>
            )}
        </div>
    );
}
