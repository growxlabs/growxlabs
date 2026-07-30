import { MemoryRecord, MemoryRetrievalQuery } from "./memory.types";
import { MemoryRedactor } from "./memory-redaction";
import { DefaultVectorRetrievalProvider } from "./vector-retrieval";

export class MemoryService {
  private static store = new Map<string, MemoryRecord>();
  private static retriever = new DefaultVectorRetrievalProvider();

  static async writeMemory(recordInput: Omit<MemoryRecord, "id" | "createdAt" | "updatedAt">): Promise<MemoryRecord> {
    const { sanitizedContent, containsSecrets } = MemoryRedactor.redact(recordInput.content);
    if (containsSecrets) {
      console.warn("Memory content contained secrets and was redacted before writing.");
    }

    const id = "mem_" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const record: MemoryRecord = {
      ...recordInput,
      id,
      content: sanitizedContent,
      createdAt: now,
      updatedAt: now
    };

    this.store.set(id, record);
    return record;
  }

  static async retrieveMemory(query: MemoryRetrievalQuery): Promise<MemoryRecord[]> {
    const candidates = Array.from(this.store.values());
    const ranked = await this.retriever.search(query, candidates);

    // Apply Token Budget Trimming
    const maxTokens = query.tokenBudget || 2000;
    let accumulatedTokens = 0;
    const finalRecords: MemoryRecord[] = [];

    for (const res of ranked) {
      const tokens = Math.ceil(res.record.content.length / 4);
      if (accumulatedTokens + tokens > maxTokens) break;
      accumulatedTokens += tokens;
      finalRecords.push(res.record);
    }

    return finalRecords;
  }

  static async deleteMemory(id: string, organisationId: string, workspaceId: string): Promise<boolean> {
    const record = this.store.get(id);
    if (!record || record.organisationId !== organisationId || record.workspaceId !== workspaceId) {
      return false;
    }

    record.status = "deleted";
    record.updatedAt = new Date().toISOString();
    return true;
  }
}
