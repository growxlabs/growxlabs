"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DocumentContainer, DocumentShell } from "@/components/document/DocumentShell";
import { AssessmentDocument } from "@/components/assessment/AssessmentDocument";
import type { AssessmentFile, ClientAssessment } from "@/types/assessment";
import { toast } from "sonner";
import { Download, Printer, Loader2 } from "lucide-react";

export function AssessmentDocumentRenderer({
  assessment,
  mode = "client",
  adminActions,
}: {
  assessment: ClientAssessment;
  mode?: "client" | "admin";
  adminActions?: ReactNode;
}) {
  const [downloading, setDownloading] = useState(false);

  async function openFile(file: AssessmentFile) {
    const endpoint =
      mode === "admin"
        ? `/api/admin/assessments/${assessment.id}/files/${file.id}`
        : `/api/client/assessment/files/${file.id}`;
    const response = await fetch(endpoint);
    const body = await response.json();
    if (response.ok && body.url) {
      window.open(body.url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDownloadPdf() {
    if (downloading) return;
    try {
      setDownloading(true);
      const filename = `${assessment.assessmentNumber || "GrowXLabs-Assessment"}.pdf`;
      const endpoint =
        mode === "admin"
          ? `/api/admin/assessments/${assessment.id}/pdf`
          : `/api/admin/assessments/${assessment.id}/pdf`; // direct admin/client pdf route

      const response = await fetch(endpoint);
      if (!response.ok) {
        let errorMsg = "Unable to generate PDF.";
        try {
          const body = await response.json();
          if (body?.error) errorMsg = body.error;
        } catch {
          // ignore non-json error
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to download PDF";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <DocumentShell>
      {/* Top Action Bar (hidden in physical print) */}
      <div className="no-print border-b border-slate-200 bg-white">
        <DocumentContainer className="flex flex-wrap items-center justify-between gap-3 py-3">
          <Link
            href={mode === "admin" ? "/admin/assessments" : "/client/dashboard"}
            className="inline-flex min-h-11 items-center rounded border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Back to {mode === "admin" ? "Assessments" : "Dashboard"}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {adminActions}

            {mode === "admin" && (
              <>
                <Link
                  href={`/admin/clients?clientId=${assessment.clientId}`}
                  className="inline-flex min-h-11 items-center rounded border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Open Client
                </Link>
                {assessment.dealId && (
                  <Link
                    href={`/admin/deals?dealId=${assessment.dealId}`}
                    className="inline-flex min-h-11 items-center rounded border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Open Deal
                  </Link>
                )}
              </>
            )}

            {/* Print button triggers physical browser print dialog */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center gap-1.5 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            {/* Download PDF button triggers real server-side binary PDF download */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex min-h-11 items-center gap-2 rounded bg-[#1d4f7a] px-4 text-sm font-semibold text-white hover:bg-[#153e61] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </DocumentContainer>
      </div>

      {/* Main Document Content */}
      <DocumentContainer className="py-7 md:py-10">
        <AssessmentDocument
          assessment={assessment}
          mode={mode}
          isPdfRender={false}
          onFile={openFile}
        />
      </DocumentContainer>
    </DocumentShell>
  );
}
