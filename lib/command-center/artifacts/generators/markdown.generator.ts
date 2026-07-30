import { ArtifactGenerationRequest } from "../artifact.types";

export class MarkdownGenerator {
  static generate(req: ArtifactGenerationRequest): string {
    if (req.content.rawMarkdown) return req.content.rawMarkdown;

    let md = `# ${req.content.title}\n\n`;

    if (req.content.sections) {
      for (const s of req.content.sections) {
        if (s.heading) md += `## ${s.heading}\n\n`;
        md += `${s.body}\n\n`;
      }
    }

    if (req.content.table) {
      const { headers, rows } = req.content.table;
      md += `| ${headers.join(" | ")} |\n`;
      md += `| ${headers.map(() => "---").join(" | ")} |\n`;
      for (const row of rows) {
        md += `| ${row.join(" | ")} |\n`;
      }
      md += "\n";
    }

    return md;
  }
}
