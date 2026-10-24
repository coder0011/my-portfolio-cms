import React from 'react';

export interface MarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder = '# Write article in Markdown...',
    minHeight = 'min-h-[350px]',
}: MarkdownEditorProps) {
    const wordCount = React.useMemo(() => {
        return value.trim() ? value.trim().split(/\s+/).length : 0;
    }, [value]);

    const charCount = value.length;

    return (
        <div className="flex h-full flex-col overflow-hidden bg-zinc-950 font-mono text-xs text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-[11px] text-zinc-400 select-none">
                <span className="font-semibold tracking-wider text-zinc-400 uppercase">
                    Raw Markdown / MDX
                </span>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} chars</span>
                </div>
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full flex-1 resize-none border-0 bg-transparent p-5 font-mono text-sm leading-relaxed text-zinc-200 outline-none selection:bg-zinc-800 placeholder:text-zinc-600 focus:ring-0 overflow-y-auto"
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    );
}

export default MarkdownEditor;
