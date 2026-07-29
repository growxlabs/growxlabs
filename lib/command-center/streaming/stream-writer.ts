export type SSEEventName = 
  | "text_delta" 
  | "tool_call" 
  | "tool_result" 
  | "proposal" 
  | "chart" 
  | "done"
  | "subagent_created"
  | "error";

export class StreamWriter {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController;

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  sendEvent(event: SSEEventName, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.controller.enqueue(this.encoder.encode(payload));
  }

  close(): void {
    this.controller.close();
  }
}
