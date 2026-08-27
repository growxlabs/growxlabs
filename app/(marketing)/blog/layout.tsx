import type { ReactNode } from "react";
import { EditorialBlogRouteShell } from "@/components/marketing/EditorialBlogRouteShell";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <EditorialBlogRouteShell>{children}</EditorialBlogRouteShell>;
}

