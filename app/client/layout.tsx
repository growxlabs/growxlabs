"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ClientNav } from "@/components/client/ClientNav";
import { Loader2 } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const publicClientRoute = pathname === "/client/login" || pathname.startsWith("/client/invite/");
  const userRole = session?.user?.role;
  const authorized = status === "authenticated" && ["CLIENT", "ADMIN", "CO_ADMIN"].includes(userRole || "");

  useEffect(() => {
    if (!publicClientRoute && status === "unauthenticated") router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }, [pathname, publicClientRoute, router, status]);

  if (publicClientRoute) return <div className="min-h-screen bg-slate-50 px-5 py-20">{children}</div>;

  if (status === "loading") {
    return (
      <div className="notion-theme min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary/40" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Loading Portal</p>
        </div>
      </div>
    );
  }

  if (!authorized) return status === "authenticated" ? <div className="min-h-screen p-10">Client portal access is required.</div> : null;


  return (
    <div className="notion-theme min-h-screen bg-[var(--background)] text-[var(--text-primary)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <ClientNav />
        <main className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
