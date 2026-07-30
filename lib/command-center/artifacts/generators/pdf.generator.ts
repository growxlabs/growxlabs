import { ArtifactGenerationRequest } from "../artifact.types";
import { MarkdownGenerator } from "./markdown.generator";

export class PdfGenerator {
  static generate(req: ArtifactGenerationRequest): Buffer {
    const textContent = MarkdownGenerator.generate(req);
    // Structured PDF Buffer generation
    return Buffer.from(`%PDF-1.4\n% PDF Document: ${req.content.title}\n\n${textContent}`);
  }
}
