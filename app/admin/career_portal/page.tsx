"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CareerPortalUnderscoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/career-portal");
  }, [router]);

  return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin text-primary h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading Career Portal...</p>
      </div>
    </div>
  );
}
