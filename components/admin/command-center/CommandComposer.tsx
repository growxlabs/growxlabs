"use client";

import { Mic, Paperclip, Plus, RotateCcw, Send, Square, X } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { MentionMenu } from "./MentionMenu";
import type { ComposerAttachment, MentionOption } from "./command-center.types";
import { mentionOptions, replaceMention, SubmissionGate } from "./composer-logic";
import { cn } from "@/lib/utils";

interface Props {
  busy: boolean;
  canRetry: boolean;
  onSubmit: (text: string, attachments: ComposerAttachment[]) => Promise<void>;
  onStop: () => void;
  onRetry: () => void;
}

export function CommandComposer({
  busy,
  canRetry,
  onSubmit,
  onStop,
  onRetry,
}: Props) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gate = useRef(new SubmissionGate());
  const options = useMemo(() => mentionOptions(value), [value]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  async function submit() {
    const text = value.trim();
    if (!text && attachments.length === 0) return;
    if (busy || !gate.current.enter()) return;
    setError("");
    try {
      await onSubmit(text, attachments);
      setValue("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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
      if (file.size > 8 * 1024 * 1024) {
        setError(`${file.name} exceeds the 8 MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        if (typeof base64 !== "string") return;
        setAttachments((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type || "application/octet-stream",
            base64,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="relative px-4 pb-4 pt-1 sm:px-6 w-full max-w-3xl mx-auto">
      
      {/* Mention Dropdown Menu */}
      <MentionMenu options={options} activeIndex={activeIndex} onSelect={choose} />

      {/* Floating Capsule Input Box (GrowX Dark Architecture) */}
      <div className="relative rounded-2xl bg-[#1e1e22] border border-white/10 shadow-2xl transition-all focus-within:border-white/20 focus-within:bg-[#222226]">
        
        {/* Attachment Badges */}
        {attachments.length > 0 && (
          <div className="px-3 pt-3 flex flex-wrap gap-2">
            {attachments.map((file) => (
              <span
                key={file.id}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-zinc-200 border border-white/10"
              >
                <Paperclip size={12} className="text-zinc-400" />
                <span className="truncate max-w-[160px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((items) => items.filter((item) => item.id !== file.id))}
                  aria-label={`Remove ${file.name}`}
                  className="hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={busy}
          rows={1}
          placeholder="Write a message... Try @agent or @project"
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (options.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              e.preventDefault();
              setActiveIndex((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
            } else if (options.length && (e.key === "Tab" || e.key === "Enter")) {
              e.preventDefault();
              choose(options[activeIndex]);
            } else if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-[#f4f4f5] outline-none placeholder:text-zinc-500 disabled:opacity-50 min-h-[48px] max-h-[180px] custom-scrollbar leading-relaxed"
        />

        {/* Toolbar Inside Bottom of Capsule */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy || attachments.length >= 5}
              className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors cursor-pointer"
              title="Attach files"
            >
              <Plus size={16} />
            </button>

            {canRetry && !busy && (
              <button
                type="button"
                onClick={onRetry}
                className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            )}
          </div>

          {/* Right Action: Mic + Send Circular Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="size-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
              title="Voice dictation"
            >
              <Mic size={15} />
            </button>

            {busy ? (
              <button
                type="button"
                onClick={onStop}
                className="size-8 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer"
                title="Stop generation"
              >
                <Square size={12} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!value.trim() && !attachments.length}
                className={cn(
                  "size-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs",
                  value.trim() || attachments.length
                    ? "bg-white text-black hover:bg-zinc-200 active:scale-95 cursor-pointer"
                    : "bg-white/10 text-zinc-500 cursor-not-allowed"
                )}
                title="Send message"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Error alert */}
      {error && (
        <p className="mt-1.5 text-center text-xs text-red-400 font-medium">
          {error}
        </p>
      )}

      {/* Bottom Subtext & Model Pill */}
      <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-zinc-500 font-sans">
        <span>GrowX AI can make mistakes. Verify critical business data.</span>
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>GXL Orchestrator · Claude Sonnet</span>
        </div>
      </div>

    </div>
  );
}
