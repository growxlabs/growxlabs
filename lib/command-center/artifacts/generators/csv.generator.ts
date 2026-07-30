import { ArtifactGenerationRequest } from "../artifact.types";
import { FormulaSanitizer } from "../formula-sanitizer";

export class CsvGenerator {
  static generate(req: ArtifactGenerationRequest): string {
    if (!req.content.table) {
      return `Title\n"${req.content.title.replace(/"/g, '""')}"\n`;
    }

    const { headers, rows } = FormulaSanitizer.sanitizeTable(
      req.content.table.headers,
      req.content.table.rows
    );

    let csv = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    for (const row of rows) {
      csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",") + "\n";
    }

    return csv;
  }
}
