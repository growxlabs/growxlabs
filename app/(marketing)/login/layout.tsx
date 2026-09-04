import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace Access | GrowXLabs",
  description: "Restricted Client & Partner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
