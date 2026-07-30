export class FormulaSanitizer {
  static sanitizeCell(val: string): string {
    if (!val) return "";
    const trimmed = val.trim();
    if (/^[=\+\-@]/.test(trimmed)) {
      return "'" + trimmed; // Neutralize formula by prepending single quote
    }
    return val;
  }

  static sanitizeTable(headers: string[], rows: string[][]): { headers: string[]; rows: string[][] } {
    const cleanHeaders = headers.map(h => this.sanitizeCell(h));
    const cleanRows = rows.map(row => row.map(cell => this.sanitizeCell(cell)));
    return { headers: cleanHeaders, rows: cleanRows };
  }
}
