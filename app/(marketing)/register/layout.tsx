import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding Gate | GrowXLabs",
  description: "Invitation-only client workspace onboarding",
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

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
