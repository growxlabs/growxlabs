"use client";

import { usePathname } from "next/navigation";
import { EditorialArticleRenderer } from "./EditorialArticleRenderer";
import { getEditorialArticle } from "./editorialArticleData";

export function EditorialBlogRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const slug = pathname.split("/").filter(Boolean).at(-1) || "";
  const article = getEditorialArticle(slug);

  if (!article) return children;

  return <EditorialArticleRenderer article={article}>{children}</EditorialArticleRenderer>;
}

