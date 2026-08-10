type EmailFieldValue = string | number | null | undefined;
export type EmailFieldTuple = [label: string, value: EmailFieldValue];

export const escapeGrowXLabsEmailHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character,
  );

export function EmailMeta(value: EmailFieldValue) {
  return `<div style="margin-top:8px;font-family:'Courier New',monospace;font-size:12px;color:#9bdcf4;letter-spacing:.08em;">{ ${escapeGrowXLabsEmailHtml(value)} }</div>`;
}

export function EmailHeader(context: string, reference?: string) {
  return `<tr><td style="padding:25px 34px;background:#101820;border-top:5px solid #18a9d1;color:#fff;"><div style="font-family:Georgia,serif;font-size:21px;font-weight:700;">GROWXLABS</div><div style="margin-top:13px;font-family:'Courier New',monospace;font-size:12px;font-weight:700;letter-spacing:.12em;color:#8dd8ed;">// ${escapeGrowXLabsEmailHtml(context.toUpperCase())}</div>${reference ? EmailMeta(reference) : ""}</td></tr>`;
}

export function EmailSection(label: string, content: string) {
  return `<div style="margin:25px 0 0;"><div style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.1em;color:#0878d1;">// ${escapeGrowXLabsEmailHtml(label.toUpperCase())}</div><div style="margin-top:12px;">${content}</div></div>`;
}

export function EmailField(label: string, value: EmailFieldValue) {
  if (value === null || value === undefined || value === "") return "";
  return `<div style="padding:11px 0;border-bottom:1px solid #e1e6eb;"><div style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.08em;color:#607086;">[ ${escapeGrowXLabsEmailHtml(label.toUpperCase())} ]</div><div style="margin-top:4px;color:#182230;">${escapeGrowXLabsEmailHtml(value)}</div></div>`;
}

export function EmailDivider() {
  return `<div aria-hidden="true" style="margin:24px 0;border-top:1px solid #dce3ea;line-height:0;">&nbsp;</div>`;
}

export function EmailAction(label: string, href: string) {
  return `<p style="margin:26px 0;"><a href="${escapeGrowXLabsEmailHtml(href)}" style="display:inline-block;padding:13px 21px;background:#0878d1;color:#fff;text-decoration:none;font-weight:700;">[ ${escapeGrowXLabsEmailHtml(label.toUpperCase())} ]</a></p>`;
}

export function EmailFooter(note = "PRIVATE & CONFIDENTIAL") {
  return `<tr><td style="padding:20px 34px 24px;border-top:1px solid #dce3ea;background:#fafbfc;color:#687585;font-family:'Courier New',monospace;font-size:11px;line-height:1.7;">------------------------------------------------<br>{ GROWXLABS }<br>growxlabs.tech<br>${escapeGrowXLabsEmailHtml(note)}</td></tr>`;
}

export function GrowXLabsEmailLayout(input: { context: string; reference?: string; preheader?: string; content: string; footerNote?: string }) {
  const context = input.context.toUpperCase();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escapeGrowXLabsEmailHtml(context)} - GrowXLabs</title></head><body data-growxlabs-email="true" style="margin:0;background:#f4f6f8;color:#182230;font-family:Arial,Helvetica,sans-serif;"><span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeGrowXLabsEmailHtml(input.preheader || input.context)}</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:30px 12px;"><tr><td align="center"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#fff;border:1px solid #dce3ea;">${EmailHeader(context, input.reference)}<tr><td style="padding:34px 34px 28px;font-size:15px;line-height:1.65;">${input.content}</td></tr>${EmailFooter(input.footerNote)}</table></td></tr></table></body></html>`;
}

export function growxlabsEmailFields(fields: EmailFieldTuple[]) {
  return `<div style="margin:22px 0;font-size:13px;line-height:1.55;">${fields.map(([label, value]) => EmailField(label, value)).join("")}</div>`;
}

export function ensureGrowXLabsEmailLayout(html: string, input: { context: string; reference?: string; preheader?: string; footerNote?: string }) {
  if (/data-growxlabs-email=["']true["']/i.test(html)) return html;
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return GrowXLabsEmailLayout({ ...input, content: body });
}

export const growxlabsEmailLayout = GrowXLabsEmailLayout;
export const growxlabsEmailAction = EmailAction;
