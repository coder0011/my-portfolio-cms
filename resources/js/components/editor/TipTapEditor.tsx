import { CodeBlock } from '@tiptap/extension-code-block';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Code,
    Table as TableIcon,
    Quote,
} from 'lucide-react';
import React, { useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    markdownToHtml,
    htmlToMarkdown,
    extractFrontmatter,
    attachFrontmatter,
} from '@/lib/markdown';

export interface TipTapEditorProps {
    content: string;
    onChange: (markdown: string, html: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export function TipTapEditor({
    content,
    onChange,
    placeholder = 'Start writing your article...',
    minHeight = 'min-h-[350px]',
}: TipTapEditorProps) {
    const isInternalUpdate = useRef(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parsedInitial = useMemo(() => extractFrontmatter(content), []);
    const rawFrontmatterRef = useRef(parsedInitial.rawFrontmatter);

    // Compute initial body HTML without accessing refs during render
    const initialHtml = useMemo(() => {
        const body = parsedInitial.body;

        if (!body) {
            return '<p></p>';
        }

        if (body.trim().startsWith('<') && body.includes('</')) {
            return body;
        }

        return markdownToHtml(body);
    }, [parsedInitial.body]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            CodeBlock,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: initialHtml,
        onUpdate: ({ editor: currentEditor }) => {
            isInternalUpdate.current = true;
            const html = currentEditor.getHTML();
            const bodyMarkdown = htmlToMarkdown(html);
            const fullMarkdown = attachFrontmatter(
                bodyMarkdown,
                rawFrontmatterRef.current,
            );

            onChange(fullMarkdown, html);
        },
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert max-w-none focus:outline-none p-6 text-sm text-foreground ${minHeight} leading-relaxed`,
            },
        },
    });

    // Keep rawFrontmatterRef updated on content change
    useEffect(() => {
        const { rawFrontmatter } = extractFrontmatter(content);

        rawFrontmatterRef.current = rawFrontmatter;
    }, [content]);

    // Sync external changes (e.g. from Markdown editor edits)
    useEffect(() => {
        if (!editor) {
            return;
        }

        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;

            return;
        }

        const { body } = extractFrontmatter(content);
        const currentHtml = editor.getHTML();
        const targetHtml =
            body.trim().startsWith('<') && body.includes('</')
                ? body
                : markdownToHtml(body);

        if (targetHtml !== currentHtml && !editor.isFocused) {
            editor.commands.setContent(targetHtml, { emitUpdate: false });
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex h-full flex-col overflow-hidden bg-card">
            {/* Editor Toolbar */}
            <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2 select-none">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('bold')
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Bold"
                >
                    <Bold className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('italic')
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Italic"
                >
                    <Italic className="h-3.5 w-3.5" />
                </Button>

                <div className="mx-1 h-4 w-px bg-border" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('heading', { level: 1 })
                            ? 'bg-muted font-bold text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Heading 1"
                >
                    <Heading1 className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('heading', { level: 2 })
                            ? 'bg-muted font-bold text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Heading 2"
                >
                    <Heading2 className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('heading', { level: 3 })
                            ? 'bg-muted font-bold text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Heading 3"
                >
                    <Heading3 className="h-3.5 w-3.5" />
                </Button>

                <div className="mx-1 h-4 w-px bg-border" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('bulletList')
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Bullet List"
                >
                    <List className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('orderedList')
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Numbered List"
                >
                    <ListOrdered className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('blockquote')
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Blockquote"
                >
                    <Quote className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={`h-7 w-7 p-0 ${
                        editor.isActive('codeBlock')
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                    }`}
                    title="Code Block"
                >
                    <Code className="h-3.5 w-3.5" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run()
                    }
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Insert Table"
                >
                    <TableIcon className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto bg-card">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default TipTapEditor;
