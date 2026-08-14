import { ReactNode } from "react";

export const metadata = {
  title: "GrowxLabs Tech Team Portal",
  description: "Secure access for GrowxLabs Tech team members",
};

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white flex flex-col">
      {children}
    </div>
  );
}
