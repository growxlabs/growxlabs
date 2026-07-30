"use client";

import { Paperclip, RotateCcw, Send, Square, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { MentionMenu } from "./MentionMenu";
import type { ComposerAttachment, MentionOption } from "./command-center.types";
import { mentionOptions, replaceMention, SubmissionGate } from "./composer-logic";

export function CommandComposer({
  busy, canRetry, onSubmit, onStop, onRetry,
}: {
  busy: boolean; canRetry: boolean;
  onSubmit: (text: string, attachments: ComposerAttachment[]) => Promise<void>;
  onStop: () => void; onRetry: () => void;
}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const gate = useRef(new SubmissionGate());
  const options = useMemo(() => mentionOptions(value), [value]);

  async function submit() {
    const text = value.trim();
    if (!text && attachments.length === 0) { setError("Enter an instruction or attach a file."); return; }
    if (busy || !gate.current.enter()) return;
    setError("");
    try {
      await onSubmit(text, attachments);
      setValue("");
      setAttachments([]);
    } finally {
      gate.current.leave();
    }
  }

  function choose(option: MentionOption) {
    setValue((current) => replaceMention(current, option));
    setActiveIndex(0);
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const available = Math.max(0, 5 - attachments.length);
    [...files].slice(0, available).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) { setError(`${file.name} exceeds the 8 MB limit.`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        if (typeof base64 !== "string") return;
        setAttachments((current) => [...current, { id: crypto.randomUUID(), name: file.name, type: file.type || "application/octet-stream", base64, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-5">
      <div className="relative mx-auto max-w-4xl">
        <MentionMenu options={options} activeIndex={activeIndex} onSelect={choose} />
        {attachments.length > 0 && <div className="mb-2 flex flex-wrap gap-2">{attachments.map((file) => (
          <span key={file.id} className="flex max-w-52 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
            <Paperclip size={12} /><span className="truncate">{file.name}</span>
            <button onClick={() => setAttachments((items) => items.filter((item) => item.id !== file.id))} aria-label={`Remove ${file.name}`}><X size={12} /></button>
          </span>
        ))}</div>}
        <div className="rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <textarea value={value} disabled={busy} rows={2} aria-label="Command message" aria-describedby={error ? "composer-error" : undefined}
            placeholder="Message your agents…  Try @agent, @project, or @model"
            onChange={(event) => { setValue(event.target.value); setError(""); }}
            onKeyDown={(event) => {
              if (options.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                event.preventDefault();
                setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
              } else if (options.length && (event.key === "Tab" || event.key === "Enter")) {
                event.preventDefault(); choose(options[activeIndex]);
              } else if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault(); void submit();
              } else if (event.key === "Escape") {
                setValue((current) => current.replace(/(?:^|\s)([@/][^\s]*)$/, ""));
              }
            }}
            className="max-h-44 min-h-16 w-full resize-none rounded-t-xl px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:bg-slate-50" />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} />
              <button onClick={() => fileRef.current?.click()} disabled={busy || attachments.length >= 5} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Attach files"><Paperclip size={16} /></button>
              {canRetry && !busy && <button onClick={onRetry} className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-slate-100"><RotateCcw size={14} />Retry</button>}
            </div>
            {busy ? (
              <button onClick={onStop} className="flex h-8 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white"><Square size={11} fill="currentColor" />Stop</button>
            ) : (
              <button onClick={() => void submit()} disabled={!value.trim() && !attachments.length} className="flex h-8 items-center gap-2 rounded-lg bg-[#0877d1] px-3 text-xs font-semibold text-white hover:bg-[#0667b9] disabled:opacity-40"><Send size={14} />Send</button>
            )}
          </div>
        </div>
        {error && <p id="composer-error" role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
        <p className="mt-1.5 text-center text-[10px] text-slate-400">Enter to send · Shift+Enter for a new line · tenant and permissions are resolved by the server</p>
      </div>
    </div>
  );
}
