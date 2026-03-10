import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link'
    ];

    return (
        <div className="bg-background text-foreground rounded-lg overflow-hidden border border-border">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                className="min-h-[300px]"
            />
            {/* Some CSS overrides for dark mode react-quill if necessary */}
            <style>{`
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid var(--border);
                    background: var(--background);
                }
                .ql-container.ql-snow {
                    border: none;
                    min-height: 250px;
                }
                .ql-editor {
                    font-size: 16px;
                }
                .dark .ql-snow .ql-stroke {
                    stroke: #e2e8f0;
                }
                .dark .ql-snow .ql-fill {
                    fill: #e2e8f0;
                }
                .dark .ql-snow .ql-picker {
                    color: #e2e8f0;
                }
            `}</style>
        </div>
    );
}
