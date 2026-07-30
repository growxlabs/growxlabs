import { ArtifactGenerationRequest } from "../artifact.types";
import { MarkdownGenerator } from "./markdown.generator";

export class PptxGenerator {
  static generate(req: ArtifactGenerationRequest): Buffer {
    const textContent = MarkdownGenerator.generate(req);
    return Buffer.from(`PPTX Presentation: ${req.content.title}\n\n${textContent}`);
  }
}
