import type { ReactNode } from "react";
import { css, cx } from "@/styled-system/css";

export function DocumentContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("document-container", containerClass, className)}>{children}</div>;
}

export function DocumentShell({ children }: { children: ReactNode }) {
  return <div className={cx("document-shell", shellClass)}>{children}</div>;
}

const containerClass = css({ width: "calc(100% - 40px)", maxW: "900px", mx: "auto" });
const shellClass = css({ minH: "100vh", bg: "#f4f6f8", color: "#152033", fontFamily: "Inter, Arial, sans-serif", pb: { base: "36px", md: "52px" }, _motionReduce: { scrollBehavior: "auto" } });
