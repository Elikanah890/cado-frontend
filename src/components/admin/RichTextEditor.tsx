'use client';

import { useEffect, useRef } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Quote, Link, Code, Eraser
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const tools: { label: string; icon: any; command: string; arg?: string }[] = [
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Underline', icon: Underline, command: 'underline' },
  { label: 'Heading 2', icon: Heading1, command: 'formatBlock', arg: '<h2>' },
  { label: 'Heading 3', icon: Heading2, command: 'formatBlock', arg: '<h3>' },
  { label: 'List', icon: List, command: 'insertUnorderedList' },
  { label: 'Numbered List', icon: ListOrdered, command: 'insertOrderedList' },
  { label: 'Quote', icon: Quote, command: 'formatBlock', arg: '<blockquote>' },
  { label: 'Inline Code', icon: Code, command: 'formatBlock', arg: '<pre>' },
];

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const addLink = () => {
    ref.current?.focus();
    const url = window.prompt('Enter link URL (https://...)');
    if (url) {
      document.execCommand('createLink', false, url);
      if (ref.current) onChange(ref.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-gold-400 transition-colors">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.label}
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={() => exec(tool.command, tool.arg)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          onMouseDown={(e) => { e.preventDefault(); }}
          onClick={addLink}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); }}
          onClick={() => exec('removeFormat')}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose prose-lg max-w-none min-h-[300px] p-4 outline-none text-gray-700 rich-editor-body"
      />
    </div>
  );
}