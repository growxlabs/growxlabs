import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: false,
  include: [
    "./components/onboarding/**/*.{ts,tsx}",
    "./components/document/**/*.{ts,tsx}",
    "./app/(careers)/careers/**/*.{ts,tsx}",
    "./components/careers/**/*.{ts,tsx}",
  ],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          portal: {
            bg: { value: "#F7F8FA" },
            surface: { value: "#FFFFFF" },
            border: { value: "#E5E7EB" },
            borderSubtle: { value: "#F0F1F3" },
            accent: { value: "#0075de" },
            accentHover: { value: "#0063bd" },
            accentSubtle: { value: "#EBF5FF" },
            text: { value: "#111827" },
            textSecondary: { value: "#475569" },
            textMuted: { value: "#64748B" },
            success: { value: "#059669" },
            successSubtle: { value: "#ECFDF5" },
            danger: { value: "#DC2626" },
            dangerSubtle: { value: "#FEF2F2" },
          },
        },
      },
      recipes: {
        statusBadge: {
          className: "status-badge",
          base: {
            display: "inline-flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "12px",
            lineHeight: "1",
            borderRadius: "9999px",
            textTransform: "uppercase",
            letterSpacing: "0.025em",
          },
          variants: {
            size: {
              sm: { px: "8px", py: "3px", fontSize: "10px" },
              md: { px: "10px", py: "4px", fontSize: "12px" },
            },
            variant: {
              default: { bg: "#F3F4F6", color: "#374151" },
              active: { bg: "#EBF5FF", color: "#0075de" },
              success: { bg: "#ECFDF5", color: "#059669" },
              danger: { bg: "#FEF2F2", color: "#DC2626" },
              warning: { bg: "#FFFBEB", color: "#D97706" },
              purple: { bg: "#F5F3FF", color: "#7C3AED" },
            },
          },
          defaultVariants: { size: "md", variant: "default" },
        },
      },
    },
  },
});
