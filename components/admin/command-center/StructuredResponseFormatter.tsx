"use client";

import React, { useState } from "react";
import { Check, Copy, Sparkles, Table as TableIcon, List, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  onSuggestion?: (text: string) => void;
}

/**
 * High-fidelity Markdown and Structured Response Formatter
 * 
 * Features:
 * 1. Robust Table Extraction: Detects tables anywhere (even directly under headings) and renders visual tables.
 * 2. Zero truncation: Never hides or reduces content with ellipsis (...).
 * 3. Zero raw markdown symbols: Completely eliminates visible *, **, ##, ///, raw pipes.
 * 4. Interactive List-to-Table View: Lists with Key: Value pairs can be toggled between List & Visual Table.
 * 5. Interactive Follow-up Questions: Automatically presents proactive conversation questions as clickable chips.
 */
export function StructuredResponseFormatter({ content, onSuggestion }: Props) {
  if (!content) return null;

  // 1. Extract protected code blocks (```lang ... ```)
  const codeBlocks: Array<{ lang: string; code: string }> = [];
  let normalized = content.replace(/\r\n/g, "\n").trim();

  normalized = normalized.replace(
    /```([a-zA-Z0-9_\-\+]*)\n?([\s\S]*?)```/g,
    (_, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push({ lang: lang?.trim() || "", code: code.replace(/\n$/, "") });
      return `\n\n__CODE_BLOCK_${idx}__\n\n`;
    }
  );

  // 2. Extract markdown tables (tables with header, separator, and data rows)
  const tableBlocks: string[][] = [];
  const tableRegex = /((?:^[ \t]*\|.+?\|[ \t]*\n)(?:^[ \t]*\|[\s\-:|]+\|[ \t]*\n)(?:^[ \t]*\|.+?\|[ \t]*(?:\n|$))+)/gm;

  normalized = normalized.replace(tableRegex, (match) => {
    const idx = tableBlocks.length;
    const lines = match
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    tableBlocks.push(lines);
    return `\n\n__TABLE_BLOCK_${idx}__\n\n`;
  });

  // 3. Split by double newlines into discrete sections
  const sections = normalized
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  // 4. Extract follow-up questions from the end of the content
  const followUpQuestions = extractFollowUpQuestions(sections);

  return (
    <div className="space-y-3.5 text-[14.5px] leading-relaxed text-zinc-200 w-full select-text">
      {sections.map((section, idx) => {
        // Check if Code Block placeholder
        const codeMatch = section.match(/^__CODE_BLOCK_(\d+)__$/);
        if (codeMatch) {
          const codeIdx = parseInt(codeMatch[1], 10);
          const item = codeBlocks[codeIdx];
          return item ? <CodeBlockCard key={idx} lang={item.lang} code={item.code} /> : null;
        }

        // Check if Table Block placeholder
        const tableMatch = section.match(/^__TABLE_BLOCK_(\d+)__$/);
        if (tableMatch) {
          const tableIdx = parseInt(tableMatch[1], 10);
          const lines = tableBlocks[tableIdx];
          return lines ? <MarkdownTable key={idx} lines={lines} /> : null;
        }

        return <ContentBlock key={idx} text={section} />;
      })}

      {/* Interactive Follow-up Questions from Agent */}
      {followUpQuestions.length > 0 && (
        <div className="mt-5 pt-3.5 border-t border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Sparkles size={14} className="text-blue-400 shrink-0" />
            <span>Suggested Next Questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {followUpQuestions.map((question, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => onSuggestion?.(question)}
                disabled={!onSuggestion}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border border-white/10 bg-[#1e1e22] px-3.5 py-2 text-xs text-zinc-300 transition-all text-left shadow-xs",
                  onSuggestion
                    ? "hover:bg-[#27272b] hover:border-blue-500/30 hover:text-white cursor-pointer active:scale-[0.99]"
                    : "opacity-75 cursor-default"
                )}
              >
                <ArrowRight size={13} className="text-blue-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <span>{question}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Extract conversational follow-up questions from the last 1-2 sections
 */
function extractFollowUpQuestions(sections: string[]): string[] {
  if (!sections.length) return [];

  const questions: string[] = [];
  const candidateSections = sections.slice(-2);

  let inExplicitSection = false;

  for (const sec of candidateSections) {
    const lines = sec.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (
        lower.includes("suggested next step") ||
        lower.includes("follow-up question") ||
        lower.includes("follow up question") ||
        lower.includes("next question") ||
        lower.includes("suggested question")
      ) {
        inExplicitSection = true;
        continue;
      }

      const cleanLine = stripMarkdownSymbols(line.replace(/^[\*\-•+]|\d+\./, "").trim());
      const isConversationalQuestion =
        /^(would|should|do you|shall|can we|could|how would|what if|are you interested)\b/i.test(
          cleanLine
        ) && cleanLine.endsWith("?");

      if ((inExplicitSection && cleanLine.endsWith("?")) || isConversationalQuestion) {
        if (cleanLine.length > 8 && !questions.includes(cleanLine)) {
          questions.push(cleanLine);
        }
      }
    }
  }

  return questions.slice(0, 3);
}

/**
 * Handles individual markdown sections: Headings, Tables, Blockquotes, Lists, and Paragraphs
 */
function ContentBlock({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n").map((l) => l.trimEnd());

  // 1. Horizontal divider (---, ***, ___)
  if (lines.length === 1 && /^(---|\*\*\*|___)$/.test(lines[0].trim())) {
    return <hr className="border-white/10 my-4" />;
  }

  // 2. Single-line explicit heading (#, ##, ###, ####)
  if (lines.length === 1 && /^#+\s+/.test(lines[0].trim())) {
    const rawHeading = lines[0].trim();
    const cleanHeading = stripMarkdownSymbols(rawHeading.replace(/^#+\s*/, ""));
    const level = (rawHeading.match(/^#+/) || [""])[0].length;

    if (level === 1) {
      return (
        <h2 className="text-lg font-bold text-white tracking-tight mt-5 mb-2">
          {cleanHeading}
        </h2>
      );
    }
    if (level === 2) {
      return (
        <h3 className="text-base font-bold text-white tracking-tight mt-4 mb-2 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
          <span>{cleanHeading}</span>
        </h3>
      );
    }
    return (
      <h4 className="text-[14.5px] font-semibold text-white tracking-tight mt-3 mb-1.5 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-blue-400/80 shrink-0" />
        <span>{cleanHeading}</span>
      </h4>
    );
  }

  // 3. Standalone bold section header (e.g. **Summary of Findings:**)
  if (
    lines.length === 1 &&
    ((lines[0].trim().startsWith("**") && lines[0].trim().endsWith("**")) ||
      (lines[0].trim().startsWith("**") && lines[0].trim().endsWith(":**"))) &&
    lines[0].trim().length < 90
  ) {
    const cleanTitle = stripMarkdownSymbols(lines[0].trim());
    return (
      <h4 className="text-[14.5px] font-semibold text-white tracking-tight mt-3 mb-1 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-blue-400 shrink-0" />
        <span>{cleanTitle}</span>
      </h4>
    );
  }

  // 4. Fallback Table Check inside ContentBlock (in case table was not matched by global regex)
  const tableSepIdx = lines.findIndex(
    (l, i) => i > 0 && /^[\|\s\-:]+$/.test(l.trim()) && l.includes("-") && lines[i - 1].includes("|")
  );

  if (tableSepIdx !== -1) {
    const beforeTableLines = lines.slice(0, tableSepIdx - 1);
    const tableLines: string[] = [];
    const afterTableLines: string[] = [];
    let parsingTable = true;

    for (let i = tableSepIdx - 1; i < lines.length; i++) {
      const line = lines[i];
      if (parsingTable && line.includes("|")) {
        tableLines.push(line);
      } else {
        parsingTable = false;
        if (line.trim()) afterTableLines.push(line);
      }
    }

    return (
      <div className="space-y-3">
        {beforeTableLines.length > 0 && <ContentBlock text={beforeTableLines.join("\n")} />}
        <MarkdownTable lines={tableLines} />
        {afterTableLines.length > 0 && <ContentBlock text={afterTableLines.join("\n")} />}
      </div>
    );
  }

  // 5. Blockquote (> Quote)
  if (lines.every((l) => l.trim() === "" || l.trim().startsWith(">"))) {
    const quoteContent = lines
      .map((l) => l.trim().replace(/^>\s?/, ""))
      .join(" ")
      .trim();

    return (
      <blockquote className="border-l-2 border-blue-400/80 bg-blue-500/5 px-4 py-2.5 rounded-r-xl text-zinc-300 text-[13.5px] italic leading-relaxed my-2">
        <CleanInlineText text={quoteContent} />
      </blockquote>
    );
  }

  // 6. Mixed lines inside block (paragraphs, bullet lists, numbered lists)
  const groups = parseMixedLines(lines);

  return (
    <div className="space-y-2">
      {groups.map((grp, gIdx) => {
        if (grp.type === "ul") {
          return <StructuredListBlock key={gIdx} items={grp.items} />;
        }

        if (grp.type === "ol") {
          return (
            <ol key={gIdx} className="space-y-2 my-2 pl-0.5">
              {grp.items.map((item, iIdx) => (
                <li
                  key={iIdx}
                  className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-200"
                >
                  <span className="font-mono text-xs font-semibold text-blue-400 mt-0.5 shrink-0 select-none min-w-4.5">
                    {iIdx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <CleanInlineText text={item} />
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        // Paragraph text
        return (
          <p key={gIdx} className="text-[14.5px] leading-relaxed text-zinc-200 my-1">
            <CleanInlineText text={grp.content} />
          </p>
        );
      })}
    </div>
  );
}

/**
 * List Block with Optional Visual Table Toggle for Key: Value lists
 */
function StructuredListBlock({ items }: { items: string[] }) {
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

  // Check if this list contains structured key-value items (e.g. 3+ items with colons)
  const isKeyValueList =
    items.length >= 3 &&
    items.every((item) => {
      const clean = stripMarkdownSymbols(item);
      const colonIdx = clean.indexOf(":");
      return colonIdx > 2 && colonIdx < 50;
    });

  if (isKeyValueList) {
    const tableRows = items.map((item) => {
      const clean = item.trim();
      const colonIdx = clean.indexOf(":");
      const key = clean.slice(0, colonIdx).trim();
      const val = clean.slice(colonIdx + 1).trim();
      return { key, val };
    });

    return (
      <div className="my-3 space-y-2">
        {/* Toggle Bar */}
        <div className="flex items-center justify-end">
          <div className="inline-flex items-center rounded-lg bg-white/5 p-0.5 border border-white/10 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                viewMode === "list" ? "bg-white/15 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <List size={12} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                viewMode === "table" ? "bg-white/15 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <TableIcon size={12} />
              <span>Table</span>
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141416]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1e1e22] text-white border-b border-white/10 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5 w-1/3">Parameter / Checkpoint</th>
                  <th className="py-2.5 px-3.5">Details & Evaluation Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-white leading-relaxed align-top">
                      <CleanInlineText text={row.key} />
                    </td>
                    <td className="py-2.5 px-3.5 leading-relaxed text-zinc-300">
                      <CleanInlineText text={row.val} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="space-y-2 pl-0.5">
            {items.map((item, iIdx) => (
              <li
                key={iIdx}
                className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-200"
              >
                <span className="size-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <CleanInlineText text={item} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Default Standard List
  return (
    <ul className="space-y-2 my-2 pl-0.5">
      {items.map((item, iIdx) => (
        <li
          key={iIdx}
          className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-200"
        >
          <span className="size-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <CleanInlineText text={item} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Group consecutive lines into paragraphs, unordered lists, and ordered lists
 */
function parseMixedLines(lines: string[]): Array<
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; content: string }
> {
  const result: Array<
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
    | { type: "p"; content: string }
  > = [];

  let currentType: "ul" | "ol" | null = null;
  let currentItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = /^[\*\-•+]\s+/.test(trimmed);
    const isOrdered = /^\d+\.\s+/.test(trimmed);

    if (isBullet) {
      const cleanItem = trimmed.replace(/^[\*\-•+]\s+/, "");
      if (currentType === "ul") {
        currentItems.push(cleanItem);
      } else {
        if (currentType && currentItems.length > 0) {
          result.push({ type: currentType, items: currentItems });
        }
        currentType = "ul";
        currentItems = [cleanItem];
      }
    } else if (isOrdered) {
      const cleanItem = trimmed.replace(/^\d+\.\s+/, "");
      if (currentType === "ol") {
        currentItems.push(cleanItem);
      } else {
        if (currentType && currentItems.length > 0) {
          result.push({ type: currentType, items: currentItems });
        }
        currentType = "ol";
        currentItems = [cleanItem];
      }
    } else {
      if (currentType && currentItems.length > 0) {
        result.push({ type: currentType, items: currentItems });
        currentType = null;
        currentItems = [];
      }
      result.push({ type: "p", content: trimmed });
    }
  }

  if (currentType && currentItems.length > 0) {
    result.push({ type: currentType, items: currentItems });
  }

  return result;
}

/**
 * Enhanced Table Component: Visual top header, copy button, status badges, dark graphite aesthetic
 */
function MarkdownTable({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);
  const cleanLines = lines.map((l) => l.trim()).filter(Boolean);
  if (cleanLines.length < 2) return null;

  const headerCells = cleanLines[0]
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

  const rowCells = cleanLines.slice(2).map((rowLine) =>
    rowLine
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim())
  );

  const handleCopyTable = () => {
    // Copy as TSV (Tab Separated Values) for seamless paste into Excel / Sheets
    const headerStr = headerCells.map((h) => stripMarkdownSymbols(h)).join("\t");
    const rowsStr = rowCells
      .map((row) => row.map((cell) => stripMarkdownSymbols(cell)).join("\t"))
      .join("\n");
    navigator.clipboard.writeText(`${headerStr}\n${rowsStr}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#141416] shadow-xs">
      {/* Visual Table Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#18181b] border-b border-white/5 text-zinc-400 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-zinc-300">
          <TableIcon size={13} className="text-blue-400" />
          <span>Table View • {rowCells.length} Records</span>
        </div>
        <button
          type="button"
          onClick={handleCopyTable}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-sans">Copy Table</span>
            </>
          )}
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1e1e22] text-white border-b border-white/10 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              {headerCells.map((h, hIdx) => (
                <th key={hIdx} className="py-2.5 px-3.5 whitespace-nowrap font-semibold">
                  <CleanInlineText text={h} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            {rowCells.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] even:bg-white/[0.015] transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-3.5 leading-relaxed">
                    <TableCellRenderer content={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Smart Cell Renderer: Auto-styles status badges (Active, Pending, etc.) and currencies
 */
function TableCellRenderer({ content }: { content: string }) {
  const clean = stripMarkdownSymbols(content).trim();
  const lower = clean.toLowerCase();

  // Status badges
  if (["active", "operational", "completed", "qualified", "live", "success"].includes(lower)) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10.5px] font-semibold">
        {clean}
      </span>
    );
  }

  if (["pending", "in progress", "review", "draft", "negotiation"].includes(lower)) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10.5px] font-semibold">
        {clean}
      </span>
    );
  }

  if (["failed", "overdue", "critical", "rejected"].includes(lower)) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10.5px] font-semibold">
        {clean}
      </span>
    );
  }

  if (["new"].includes(lower)) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10.5px] font-semibold">
        {clean}
      </span>
    );
  }

  return <CleanInlineText text={content} />;
}

/**
 * Code Block Card: Dark `#121214` editor style with interactive copy button
 */
function CodeBlockCard({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-white/10 bg-[#121214] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#18181b] border-b border-white/5 text-zinc-400 text-xs font-mono">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Render inline formatting (bold, italic, code, link) with ZERO raw asterisks
 */
export function CleanInlineText({ text }: { text: string }) {
  if (!text) return null;

  // Clean any leading comments (// Note:) or hashes (###)
  let processed = text.replace(/^\/\/\s*/, "").replace(/^#+\s*/, "");

  // Match:
  // 1. inline code: `...`
  // 2. bold: **...**
  // 3. italic: *...*
  // 4. link: [title](url)
  const pattern = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = processed.split(pattern);

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Inline Code `...`
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 font-mono text-[13px] border border-white/5 mx-0.5"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // Bold Italic ***...***
        if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
          const content = stripMarkdownSymbols(part.slice(3, -3));
          return (
            <strong key={idx} className="font-semibold text-white italic">
              {content}
            </strong>
          );
        }

        // Bold **...**
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          const content = stripMarkdownSymbols(part.slice(2, -2));
          return (
            <strong key={idx} className="font-semibold text-white">
              {content}
            </strong>
          );
        }

        // Italic *...*
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          const content = stripMarkdownSymbols(part.slice(1, -1));
          return (
            <em key={idx} className="text-zinc-300 italic font-medium">
              {content}
            </em>
          );
        }

        // Markdown Link [title](url)
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            return (
              <a
                key={idx}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium"
              >
                {stripMarkdownSymbols(match[1])}
              </a>
            );
          }
        }

        // Plain Text - strip any lingering stray asterisks or hashes
        const cleaned = stripMarkdownSymbols(part);
        return <span key={idx}>{cleaned}</span>;
      })}
    </>
  );
}

/**
 * Remove all asterisk characters and stray markdown symbols from a string
 */
function stripMarkdownSymbols(str: string): string {
  if (!str) return "";
  return str
    .replace(/\*/g, "")
    .replace(/^#+\s*/, "")
    .replace(/^\/\/\s*/, "");
}
