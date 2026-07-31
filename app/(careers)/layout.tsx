import { CareersHeader } from "@/components/careers/CareersHeader";
import { Footer } from "@/components/layout/Footer";

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="careers-shell flex min-h-dvh flex-col overflow-x-clip bg-[#f8fafc]">
      <CareersHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
