"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIPlatformRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/command-center");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 text-xs space-y-2">
      <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      <span>Redirecting to Command Center...</span>
    </div>
  );
}
