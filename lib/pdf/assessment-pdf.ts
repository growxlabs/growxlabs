import fs from "node:fs";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import type { AssessmentAnswerValue, AssessmentFile, AssessmentQuestion, ClientAssessment } from "../../types/assessment.ts";

/**
 * Resolve Chrome / Chromium / Edge executable across platforms.
 */
export function getExecutablePath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";

  const candidates: string[] = [];

  if (isWindows) {
    const programFiles = process.env["ProgramFiles"] || "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    const localAppData = process.env["LOCALAPPDATA"] || "";

    candidates.push(
      path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
      path.join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe")
    );
    if (localAppData) {
      candidates.push(
        path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(localAppData, "Microsoft", "Edge", "Application", "msedge.exe")
      );
    }
  } else if (isMac) {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    );
  } else {
    // Linux
    candidates.push(
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/snap/bin/chromium"
    );
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    "Chromium/Chrome executable not found. Please set PUPPETEER_EXECUTABLE_PATH environment variable."
  );
}

function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function answerText(value: AssessmentAnswerValue | undefined): string {
  return typeof value === "string" && value.trim() ? value : "Not provided";
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_started: "Not Started",
    draft: "In Progress",
    submitted: "Submitted",
    under_review: "Consulting Review in Progress",
    more_information_required: "Additional Information Required",
    review_complete: "Review Complete",
    archived: "Archived",
  };
  return labels[status] || "In Progress";
}

function renderValueHtml(question: AssessmentQuestion, value: AssessmentAnswerValue | undefined): string {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    const listItems = value
      .map((item) => {
        const label = question.options?.find((o) => o.value === item)?.label || humanize(item);
        return `<li>${escapeHtml(label)}</li>`;
      })
      .join("");
    return `<ul class="list-disc space-y-1 pl-5">${listItems}</ul>`;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (question.fieldType === "signature") {
    return `<div class="signature-block break-inside-avoid inline-block rounded border border-slate-300 bg-slate-50 px-4 py-2 font-serif text-base italic text-slate-900">${escapeHtml(
      value
    )}</div>`;
  }

  if (typeof value === "string") {
    const label = question.options?.find((o) => o.value === value)?.label || humanize(value);
    return `<span class="whitespace-pre-wrap">${escapeHtml(label)}</span>`;
  }

  return escapeHtml(value);
}

function renderAnswerRowHtml(
  question: AssessmentQuestion,
  value: AssessmentAnswerValue | undefined,
  files: AssessmentFile[]
): string {
  let contentHtml = "";

  if (question.fieldType === "file_upload") {
    if (files.length) {
      contentHtml = files
        .map((f) => `<span class="mr-2">${escapeHtml(f.fileName)}</span>`)
        .join("");
    } else {
      contentHtml = "Not provided";
    }
  } else {
    contentHtml = renderValueHtml(question, value);
  }

  return `
    <div class="assessment-document-answer assessment-field-row grid gap-2 md:grid-cols-[240px_1fr] md:gap-8 break-inside-avoid">
      <dt class="text-sm font-semibold leading-6 text-slate-700">${escapeHtml(question.label)}</dt>
      <dd class="min-w-0 [overflow-wrap:anywhere] text-sm leading-7 text-slate-900">${contentHtml}</dd>
    </div>
  `;
}

/**
 * Generate a complete standalone HTML document for high-fidelity A4 PDF rasterization.
 */
export function renderAssessmentDocumentHtml(assessment: ClientAssessment): string {
  const clientName = answerText(assessment.answers.primary_contact || assessment.answers.contact_name);
  const companyName = answerText(assessment.answers.business_name || assessment.answers.company_name);
  const submittedOn = assessment.submittedAt
    ? new Date(assessment.submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not submitted";
  const generated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const sectionsHtml = assessment.template.sections
    .map((section) => {
      const questionsHtml = section.questions
        .filter((q) => q.fieldType !== "summary")
        .map((question) =>
          renderAnswerRowHtml(
            question,
            assessment.answers[question.key],
            assessment.files.filter((f) => f.questionKey === question.key)
          )
        )
        .join("");

      return `
        <section class="assessment-document-section border-b border-slate-300 py-9 last:border-b-0 md:py-11">
          <div class="mb-7 grid grid-cols-[42px_1fr] gap-3">
            <span class="font-serif text-xl text-[#1d4f7a]">${escapeHtml(
              String(section.position).padStart(2, "0")
            )}</span>
            <div>
              <h2 class="font-serif text-2xl text-slate-950">${escapeHtml(section.title)}</h2>
              ${
                section.description
                  ? `<p class="mt-2 text-sm leading-6 text-slate-600">${escapeHtml(section.description)}</p>`
                  : ""
              }
            </div>
          </div>
          <dl class="grid gap-6">
            ${questionsHtml}
          </dl>
        </section>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(assessment.assessmentNumber || "GrowXLabs-Assessment")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    *, ::before, ::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: #e2e8f0;
      margin: 0;
      padding: 0;
    }

    html, body {
      background-color: #ffffff;
      color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm;
    }

    .font-serif {
      font-family: 'Playfair Display', Georgia, Cambria, "Times New Roman", Times, serif;
    }

    .font-mono {
      font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Layout & Flexbox */
    .flex { display: flex; }
    .grid { display: grid; }
    .hidden { display: none; }
    .inline-block { display: inline-block; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    /* Gap */
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-7 { gap: 1.75rem; }
    .gap-8 { gap: 2rem; }
    .gap-x-8 { column-gap: 2rem; }
    .gap-y-4 { row-gap: 1rem; }

    /* Spacing */
    .p-0 { padding: 0; }
    .p-3 { padding: 0.75rem; }
    .p-5 { padding: 1.25rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-12 { padding-left: 3rem; padding-right: 3rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-7 { padding-top: 1.75rem; padding-bottom: 1.75rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-9 { padding-top: 2.25rem; padding-bottom: 2.25rem; }
    .py-11 { padding-top: 2.75rem; padding-bottom: 2.75rem; }
    .pt-6 { padding-top: 1.5rem; }
    .pl-5 { padding-left: 1.25rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-9 { margin-top: 2.25rem; }
    .mb-7 { margin-bottom: 1.75rem; }
    .mr-2 { margin-right: 0.5rem; }

    /* Sizing */
    .max-w-3xl { max-width: 48rem; }

    /* Typography */
    .text-\\[10px\\] { font-size: 10px; }
    .text-\\[11px\\] { font-size: 11px; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }

    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .italic { font-style: italic; }

    .uppercase { text-transform: uppercase; }
    .capitalize { text-transform: capitalize; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .tracking-\\[\\.15em\\] { letter-spacing: 0.15em; }
    .tracking-\\[\\.16em\\] { letter-spacing: 0.16em; }
    .leading-tight { line-height: 1.25; }
    .leading-6 { line-height: 1.5rem; }
    .leading-7 { line-height: 1.75rem; }
    .whitespace-pre-wrap { white-space: pre-wrap; }
    .break-words { overflow-wrap: break-word; }
    .\\[overflow-wrap\\:anywhere\\] { overflow-wrap: anywhere; }

    /* Colors */
    .text-slate-500 { color: #64748b; }
    .text-slate-600 { color: #475569; }
    .text-slate-700 { color: #334155; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-950 { color: #020617; }
    .text-red-800 { color: #991b1b; }
    .text-\\[\\#1d5f8d\\] { color: #1d5f8d; }
    .text-\\[\\#1d4f7a\\] { color: #1d4f7a; }

    .bg-white { background-color: #ffffff; }
    .bg-slate-50 { background-color: #f8fafc; }

    /* Borders */
    .border { border-width: 1px; }
    .border-t { border-top-width: 1px; }
    .border-b { border-bottom-width: 1px; }
    .border-t-2 { border-top-width: 2px; }
    .border-b-2 { border-bottom-width: 2px; }
    .border-slate-200 { border-color: #e2e8f0; }
    .border-slate-300 { border-color: #cbd5e1; }
    .border-slate-800 { border-color: #1e293b; }
    .rounded { border-radius: 0.25rem; }
    .rounded-md { border-radius: 0.375rem; }

    /* Grid columns */
    .grid-cols-\\[42px_1fr\\] { grid-template-columns: 42px 1fr; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

    @media (min-width: 640px) {
      .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .sm\\:text-center { text-align: center; }
      .sm\\:text-right { text-align: right; }
    }

    @media (min-width: 768px) {
      .md\\:px-12 { padding-left: 3rem; padding-right: 3rem; }
      .md\\:py-11 { padding-top: 2.75rem; padding-bottom: 2.75rem; }
      .md\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
      .md\\:grid-cols-\\[240px_1fr\\] { grid-template-columns: 240px 1fr; }
      .md\\:gap-8 { gap: 2rem; }
    }

    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }

    /* Lists */
    .list-disc { list-style-type: disc; }
    .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }

    /* A4 Pagination Rules */
    .assessment-document {
      width: 100%;
      background: #ffffff;
    }

    .assessment-field-row,
    .assessment-metadata-item,
    .signature-block,
    .assessment-document-answer,
    .assessment-document-footer {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .assessment-document-section {
      break-inside: auto;
      page-break-inside: auto;
    }

    .assessment-document-section > div:first-child,
    .assessment-document-answer dt {
      break-after: avoid;
      page-break-after: avoid;
    }

    .no-print {
      display: none !important;
    }
  </style>
</head>
<body>
  <article class="assessment-document overflow-hidden bg-white">
    <header class="border-b-2 border-slate-800 px-6 py-8 md:px-12 md:py-11">
      <div class="flex justify-between gap-7">
        <div>
          <div class="text-2xl font-extrabold tracking-tight">
            GrowX<span class="text-[#1d5f8d]">Labs.tech</span>
          </div>
          <p class="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
            AI-Native Software Company
          </p>
        </div>
        <div class="text-right">
          <p class="text-[11px] font-bold uppercase tracking-[.15em] text-red-800">Confidential</p>
          <p class="mt-2 text-xs text-slate-500">Business consulting document</p>
        </div>
      </div>

      <h1 class="mt-9 max-w-3xl font-serif text-3xl leading-tight text-slate-950 md:text-4xl">
        Business Discovery &amp; Consulting Assessment
      </h1>

      <dl class="mt-8 grid gap-x-8 gap-y-4 border-t border-slate-200 pt-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessment Number</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">${escapeHtml(
            assessment.assessmentNumber || "Not assigned"
          )}</dd>
        </div>
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Client</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">${escapeHtml(clientName)}</dd>
        </div>
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">${escapeHtml(companyName)}</dd>
        </div>
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted On</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">${escapeHtml(submittedOn)}</dd>
        </div>
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessment Status</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">${escapeHtml(
            statusLabel(assessment.status)
          )}</dd>
        </div>
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Prepared By</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">GrowXLabs</dd>
        </div>
        <div class="assessment-metadata-item break-inside-avoid">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidentiality</dt>
          <dd class="mt-1 break-words font-medium text-slate-900">Confidential</dd>
        </div>
      </dl>
    </header>

    <div class="px-6 md:px-12">
      ${sectionsHtml}
    </div>

    <footer class="assessment-document-footer border-t-2 border-slate-800 px-6 py-7 text-xs text-slate-600 md:px-12">
      <div class="grid gap-3 sm:grid-cols-3">
        <div>
          <strong class="block uppercase tracking-wider text-slate-800">GrowXLabs</strong>
          <span>Confidential Client Information</span>
        </div>
        <div class="sm:text-center">
          <span class="block">Assessment Number: ${escapeHtml(
            assessment.assessmentNumber || "Not assigned"
          )}</span>
        </div>
        <div class="sm:text-right">
          <span class="block">Generated On: ${escapeHtml(generated)}</span>
          <span class="print-page-number">Page</span>
        </div>
      </div>
    </footer>
  </article>
</body>
</html>`;
}

/**
 * Generate binary PDF Buffer using headless Chromium.
 */
export async function generateAssessmentPdf(assessment: ClientAssessment): Promise<Buffer> {
  const executablePath = getExecutablePath();
  const html = renderAssessmentDocumentHtml(assessment);

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
        "--hide-scrollbars",
      ],
    });

    const page = await browser.newPage();

    // Set high-DPI viewport matching A4 proportions
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Ensure web fonts are completely loaded before rasterizing
    await page.evaluateHandle("document.fonts.ready");

    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
      displayHeaderFooter: false, // Ensures zero Chrome URLs/dates/headers/footers
      margin: {
        top: "14mm",
        bottom: "16mm",
        left: "14mm",
        right: "14mm",
      },
    });

    return Buffer.from(pdfUint8Array);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
