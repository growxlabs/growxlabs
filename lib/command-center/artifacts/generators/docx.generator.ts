import { ArtifactGenerationRequest } from "../artifact.types";
import { MarkdownGenerator } from "./markdown.generator";

export class DocxGenerator {
  static generate(req: ArtifactGenerationRequest): Buffer {
    const textContent = MarkdownGenerator.generate(req);
    return Buffer.from(`DOCX Document: ${req.content.title}\n\n${textContent}`);
  }
}
