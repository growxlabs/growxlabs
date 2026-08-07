import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: false,
  include: [
    "./components/onboarding/**/*.{ts,tsx}",
    "./components/document/**/*.{ts,tsx}",
    "./app/(careers)/careers/**/*.{ts,tsx}",
  ],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",
});
