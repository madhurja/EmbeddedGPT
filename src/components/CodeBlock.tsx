import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  language: string;
  code: string;
  description?: string;
}

function highlightSyntax(code: string, language: string): string {
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (language === "cpp" || language === "c" || language === "arduino") {
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$)/gm,
      '<span class="syntax-comment">$1</span>'
    );
    highlighted = highlighted.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="syntax-comment">$1</span>'
    );
    // Strings
    highlighted = highlighted.replace(
      /("(?:[^"\\]|\\.)*")/g,
      '<span class="syntax-string">$1</span>'
    );
    // Keywords
    const keywords = [
      "include",
      "define",
      "void",
      "int",
      "float",
      "double",
      "char",
      "bool",
      "if",
      "else",
      "for",
      "while",
      "return",
      "const",
      "static",
      "struct",
      "class",
      "public",
      "private",
      "setup",
      "loop",
      "true",
      "false",
      "Serial",
      "Wire",
      "delay",
      "begin",
      "print",
      "println",
      " digitalWrite",
      "pinMode",
      "analogRead",
      "digitalRead",
      "HIGH",
      "LOW",
      "INPUT",
      "OUTPUT",
      "String",
      "byte",
      "long",
      "unsigned",
      "typedef",
      "enum",
      "union",
      "volatile",
      "extern",
      "inline",
      "switch",
      "case",
      "break",
      "continue",
      "default",
      "sizeof",
      "nullptr",
      "NULL",
      "ESP_ERROR_CHECK",
      "static_cast",
    ];
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    highlighted = highlighted.replace(
      keywordRegex,
      '<span class="syntax-keyword">$1</span>'
    );
    // Functions
    highlighted = highlighted.replace(
      /(\w+)(\s*\()/g,
      '<span class="syntax-function">$1</span>$2'
    );
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="syntax-number">$1</span>'
    );
  }

  return highlighted;
}

export default function CodeBlock({
  language,
  code,
  description,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const highlighted = highlightSyntax(code, language);

  return (
    <div
      className="rounded overflow-hidden my-3"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: "#161616" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "#a0c4c4" }}
          >
            {language}
          </span>
          {description && (
            <span className="text-xs" style={{ color: "#555" }}>
              {description}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-white/5"
          style={{ color: "#555" }}
        >
          {copied ? (
            <>
              <Check size={12} style={{ color: "#4ade80" }} />
              <span className="text-xs" style={{ color: "#4ade80" }}>
                Copied!
              </span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code
          className="font-mono text-sm leading-relaxed"
          style={{ color: "#eee" }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
