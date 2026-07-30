import { ArtifactGenerationRequest } from "../artifact.types";
import { FormulaSanitizer } from "../formula-sanitizer";

export class XlsxGenerator {
  static generate(req: ArtifactGenerationRequest): Buffer {
    let content = `Spreadsheet Title: ${req.content.title}\n`;
    if (req.content.table) {
      const { headers, rows } = FormulaSanitizer.sanitizeTable(
        req.content.table.headers,
        req.content.table.rows
      );
      content += headers.join("\t") + "\n";
      for (const r of rows) {
        content += r.join("\t") + "\n";
      }
    }
    return Buffer.from(content);
  }
}
