import { MemoryRecord, MemoryRetrievalQuery } from "./memory.types";

export interface VectorRetrievalResult {
  record: MemoryRecord;
  score: number;
  matchType: "exact" | "metadata" | "vector";
}

export interface VectorRetrievalProvider {
  search(query: MemoryRetrievalQuery, candidates: MemoryRecord[]): Promise<VectorRetrievalResult[]>;
}

export class DefaultVectorRetrievalProvider implements VectorRetrievalProvider {
  async search(query: MemoryRetrievalQuery, candidates: MemoryRecord[]): Promise<VectorRetrievalResult[]> {
    // 1. Tenant filtering (Strict Scope)
    const tenantScoped = candidates.filter(
      r => r.organisationId === query.organisationId && r.workspaceId === query.workspaceId && r.status === "active"
    );

    // 2. Exact/Keyword & Metadata Search Fallback
    const searchTerms = (query.searchQuery || "").toLowerCase().split(/\s+/).filter(Boolean);
    const results: VectorRetrievalResult[] = [];

    for (const record of tenantScoped) {
      if (query.memoryType && record.memoryType !== query.memoryType) continue;
      if (query.ownerType && record.ownerType !== query.ownerType) continue;

      let score = 0;
      let matchType: "exact" | "metadata" | "vector" = "metadata";

      const text = `${record.title || ""} ${record.content}`.toLowerCase();
      if (searchTerms.length > 0) {
        const matches = searchTerms.filter(term => text.includes(term));
        if (matches.length === searchTerms.length) {
          score = 1.0;
          matchType = "exact";
        } else if (matches.length > 0) {
          score = matches.length / searchTerms.length;
          matchType = "metadata";
        } else {
          continue; // No keyword match
        }
      } else {
        score = 0.5; // Default score when no query specified
      }

      results.push({ record, score, matchType });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.topK || 5);
  }
}
