"use client";

import { css, cx } from "@/styled-system/css";
import { DocumentContainer } from "./DocumentShell";

export function DocumentActionBar({ section, submitting, onPrevious, onSave, onNext, onSubmit }: { section: number; submitting: boolean; onPrevious: () => void; onSave: () => void; onNext: () => void; onSubmit: () => void }) {
  return (
    <nav aria-label="Assessment navigation" className={cx("document-action-bar", css({ bg: "#fff", border: "1px solid #d9dee5", borderTop: "0" }))}>
      <DocumentContainer className={css({ width: "100%", maxW: "none", px: { base: "20px", md: "46px" }, py: { base: "16px", md: "20px" }, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", alignItems: "center", gap: { base: "8px", md: "14px" } })}>
        <button type="button" onClick={onPrevious} disabled={section === 0} className={secondaryButton}>Previous</button>
        <button type="button" onClick={onSave} className={secondaryButton}>Save Draft</button>
        {section < 11 ? <button type="button" onClick={onNext} className={primaryButton}>Next</button> : <button type="button" onClick={onSubmit} disabled={submitting} className={primaryButton}>{submitting ? "Submitting…" : "Submit Assessment"}</button>}
      </DocumentContainer>
    </nav>
  );
}

const buttonBase = { minH: "42px", borderRadius: "4px", px: { base: "8px", md: "20px" }, fontSize: { base: "12px", md: "13px" }, fontWeight: "700", cursor: "pointer", _focusVisible: { outline: "2px solid #1d4f7a", outlineOffset: "2px" }, _disabled: { opacity: ".45", cursor: "not-allowed" } } as const;
const primaryButton = css({ ...buttonBase, bg: "#173f63", color: "#fff", _hover: { bg: "#0e304e" } });
const secondaryButton = css({ ...buttonBase, border: "1px solid #c8d0da", bg: "#fff", color: "#334155", _hover: { bg: "#f5f7f9" } });
