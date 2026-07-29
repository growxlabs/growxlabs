export type PromptType = "system" | "persona" | "routing" | "tool_guidance" | "formatting";

export interface PromptTemplate {
  id: string;
  version: string;
  name: string;
  description: string;
  type: PromptType;
  supportedAgentIds: string[];
  template: string;
  status: "active" | "deprecated";
  createdAt: string;
  checksum: string;
}
