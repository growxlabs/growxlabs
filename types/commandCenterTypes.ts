import { MessageContract, ToolCallState } from "./commandCenterContracts";

export type AgentPersonaId = 
  | "ceo" 
  | "cfo" 
  | "sales" 
  | "marketing" 
  | "research" 
  | "content" 
  | "seo" 
  | "cto" 
  | "proposal";

export interface AgentPersonaConfig {
  id: AgentPersonaId;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  capabilities: string[];
}

export interface SubagentState {
  id: string;
  name: string;
  focus: string;
  mission: string;
  status: "running" | "completed" | "error";
  logs: string[];
  result?: string;
}

export interface ProposalPayload {
  clientName: string;
  businessName?: string;
  selectedPackage?: string;
  customPrice?: string;
  problem?: string;
  impact?: string;
  budget?: string;
  timeline?: string;
  deliverables?: string[];
  status?: string;
  proposalId?: string;
  pdfUrl?: string;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  [key: string]: string | number;
}

export interface AttachmentItem {
  name: string;
  type: string;
  size?: number;
  base64?: string;
  url?: string;
}

export interface CommandCenterSessionState {
  activeConversationId: string;
  selectedPersona: AgentPersonaId | "all";
  isSidebarOpen: boolean;
  isInspectorOpen: boolean;
  isProcessing: boolean;
  activeSubagents: SubagentState[];
}

export interface ProcessMessageRequestDTO {
  message: string;
  conversationId?: string;
  history?: MessageContract[];
  attachments?: AttachmentItem[];
}
