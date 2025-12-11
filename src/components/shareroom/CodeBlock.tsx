import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Hash } from 'lucide-react';
import { highlightCode, detectLanguage } from '@/lib/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const detectedLang = language || detectLanguage(code);
  const lines = code.split('\n');

  const highlightedCode = useMemo(() => {
    return highlightCode(code, detectedLang);
  }, [code, detectedLang]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-mono-300 bg-mono-100">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-mono-200/50 border-b border-mono-300">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs text-mono-500 font-mono ml-2">
            {detectedLang}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="h-7 px-2 text-mono-500 hover:text-mono-800 hover:bg-mono-200"
          >
            <Hash className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyCode}
            className="h-7 px-2 text-mono-500 hover:text-mono-800 hover:bg-mono-200"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="ml-1.5 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto max-h-[400px] code-scrollbar">
        <pre className="p-4 text-sm font-mono">
          <code className="flex">
            {showLineNumbers && (
              <span className="select-none pr-4 mr-4 border-r border-mono-300 text-mono-400 text-right min-w-[2.5rem]">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </span>
            )}
            <span
              className="flex-1"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </code>
        </pre>
      </div>
    </div>
  );
};
