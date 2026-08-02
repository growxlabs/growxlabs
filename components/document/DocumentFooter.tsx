import type { RefObject } from "react";
import { css } from "@/styled-system/css";
import { DocumentContainer } from "./DocumentShell";

export function DocumentFooter({ section, progress, footerRef, onRestoreDraft }: { section: number; progress: number; footerRef: RefObject<HTMLElement | null>; onRestoreDraft: () => void }) {
  return (
    <footer ref={footerRef} className={css({ bg: "#fff", border: "1px solid #d9dee5", borderTop: "0", borderRadius: "0 0 6px 6px" })}>
      <DocumentContainer className={css({ width: "100%", maxW: "none", px: { base: "20px", md: "46px" }, py: "28px", display: "grid", gridTemplateColumns: { base: "1fr", md: "1fr 1.2fr 1fr" }, gap: { base: "18px", md: "24px" }, alignItems: "start" })}>
        <div><strong className={footerHeading}>GrowXLabs.tech</strong><a href="mailto:sai@growxlabs.tech" className={footerLink}>sai@growxlabs.tech</a></div>
        <div className={css({ textAlign: { base: "left", md: "center" } })}><strong className={footerHeading}>Business Discovery Assessment</strong><span className={footerText}>Confidential client information</span></div>
        <div className={css({ textAlign: { base: "left", md: "right" } })}><span className={footerText}>Version 1.0 · Section {section + 1} of 12 · {Math.round(progress)}%</span><div className={css({ mt: "5px", display: "flex", justifyContent: { base: "flex-start", md: "flex-end" }, gap: "10px" })}><a href="/privacy" className={footerLink}>Privacy</a><span className={footerText}>·</span><a href="/terms" className={footerLink}>Terms</a></div><button type="button" onClick={onRestoreDraft} className={css({ mt: "7px", color: "#40546d", fontSize: "11px", textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", _focusVisible: { outline: "2px solid #1d4f7a", outlineOffset: "3px" } })}>Restore saved draft</button></div>
      </DocumentContainer>
    </footer>
  );
}

const footerHeading = css({ display: "block", color: "#29364a", fontSize: "11px", fontWeight: "750", letterSpacing: ".06em", textTransform: "uppercase" });
const footerText = css({ display: "block", color: "#758092", fontSize: "11px", lineHeight: "1.6", mt: "4px" });
const footerLink = css({ display: "inline-block", color: "#40546d", fontSize: "11px", lineHeight: "1.6", mt: "4px", textDecoration: "underline", textUnderlineOffset: "2px", _focusVisible: { outline: "2px solid #1d4f7a", outlineOffset: "3px" } });
