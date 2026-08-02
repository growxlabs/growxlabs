import { css } from "@/styled-system/css";
import { DocumentContainer } from "./DocumentShell";

export function DocumentHeader() {
  return (
    <header className={css({ bg: "#fff", borderBottom: "1px solid #d9dee5" })}>
      <DocumentContainer className={css({ minH: { base: "68px", sm: "76px", lg: "88px" }, py: { base: "14px", sm: "16px" }, display: "flex", flexDirection: { base: "column", sm: "row" }, alignItems: { base: "flex-start", sm: "center" }, justifyContent: "space-between", gap: { base: "10px", sm: "28px" } })}>
        <div><div className={css({ fontSize: "19px", fontWeight: "800", letterSpacing: "-0.025em" })}>GrowX<span className={css({ color: "#1d5f8d" })}>Labs.tech</span></div><div className={css({ color: "#6f7b8c", fontSize: "9px", fontWeight: "700", letterSpacing: ".14em", textTransform: "uppercase", mt: "2px" })}>AI-Native Software Company</div></div>
        <div className={css({ textAlign: { base: "left", sm: "right" } })}><div className={css({ color: "#233247", fontSize: { base: "12px", md: "13px" }, fontWeight: "750", letterSpacing: ".08em", textTransform: "uppercase" })}>Business Discovery & Consulting Assessment</div><div className={css({ mt: "3px", display: "flex", justifyContent: { base: "flex-start", sm: "flex-end" }, gap: "12px", color: "#768192", fontSize: "10px" })}><span>Document v1.0</span><a href="mailto:sai@growxlabs.tech" className={css({ color: "#405a74", textDecoration: "underline", textUnderlineOffset: "2px", _focusVisible: { outline: "2px solid #1d4f7a", outlineOffset: "3px" } })}>Contact</a></div></div>
      </DocumentContainer>
    </header>
  );
}
