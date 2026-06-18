// components/mdx/CodeBlock.tsx
"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  language,
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const code = codeRef.current?.textContent || children;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = children.trim().split("\n");

  return (
    <div className="group relative my-6 overflow-hidden rounded-card border border-inverse bg-surface-graphite text-surface-graphite-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-inverse bg-surface-graphite-elevated px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Language badge */}
          {language && (
            <span className="rounded-control border border-inverse px-2 py-0.5 text-xs font-medium text-surface-graphite-muted">
              {language}
            </span>
          )}
          {/* Filename */}
          {filename && (
            <span className="text-sm text-surface-graphite-muted">{filename}</span>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-control px-2 py-1 text-xs text-surface-graphite-muted opacity-0 transition-colors hover:bg-surface-graphite hover:text-surface-graphite-foreground group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-accent" />
              <span className="text-accent">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre
          ref={codeRef}
          className="p-4 text-sm leading-relaxed"
          style={{ margin: 0 }}
        >
          <code className={language ? `language-${language}` : ""}>
            {showLineNumbers
              ? lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell select-none pr-4 text-right text-surface-graphite-muted">
                      {i + 1}
                    </span>
                    <span className="table-cell">{line || " "}</span>
                  </div>
                ))
              : children}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Inline code component
 */
export function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded-control border border-border bg-muted px-1.5 py-0.5 font-mono text-sm text-accent">
      {children}
    </code>
  );
}

export default CodeBlock;
