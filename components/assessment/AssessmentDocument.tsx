import type { ReactNode } from "react";
import type { AssessmentAnswerValue, AssessmentFile, AssessmentQuestion, ClientAssessment } from "../../types/assessment.ts";

export function AssessmentDocument({
  assessment,
  mode = "client",
  isPdfRender = false,
  onFile,
}: {
  assessment: ClientAssessment;
  mode?: "client" | "admin";
  isPdfRender?: boolean;
  onFile?: (file: AssessmentFile) => void;
}) {
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

  return (
    <article
      className={`assessment-document overflow-hidden bg-white ${
        isPdfRender ? "border-0 shadow-none" : "border border-slate-300 shadow-sm print:border-0 print:shadow-none"
      }`}
    >
      {/* Document Header */}
      <header className="border-b-2 border-slate-800 px-6 py-8 md:px-12 md:py-11">
        <div className="flex justify-between gap-7">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">
              GrowX<span className="text-[#1d5f8d]">Labs.tech</span>
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
              AI-Native Software Company
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[.15em] text-red-800">Confidential</p>
            <p className="mt-2 text-xs text-slate-500">Business consulting document</p>
          </div>
        </div>

        <h1 className="mt-9 max-w-3xl font-serif text-3xl leading-tight text-slate-950 md:text-4xl">
          Business Discovery &amp; Consulting Assessment
        </h1>

        {/* Metadata Grid */}
        <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-slate-200 pt-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Meta label="Assessment Number" value={assessment.assessmentNumber || "Not assigned"} />
          <Meta label="Client" value={clientName} />
          <Meta label="Company" value={companyName} />
          <Meta label="Submitted On" value={submittedOn} />
          <Meta label="Assessment Status" value={statusLabel(assessment.status)} />
          <Meta label="Prepared By" value="GrowXLabs" />
          <Meta label="Confidentiality" value="Confidential" />
        </dl>

        {/* Internal Metadata (Hidden during PDF render or physical print) */}
        {mode === "admin" && !isPdfRender && (
          <details className="no-print mt-6 rounded border border-dashed border-slate-300 p-3 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold">Internal Document Information</summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <span>Internal UUID: {assessment.id}</span>
              <span>Template Version: {assessment.templateVersion}</span>
              <span>Template ID: {assessment.templateId}</span>
              <span>Database Status: {assessment.status}</span>
              <span>Client ID: {assessment.clientId}</span>
              <span>Deal ID: {assessment.dealId || "—"}</span>
            </div>
          </details>
        )}
      </header>

      {/* Sections and Answers */}
      <div className="px-6 md:px-12">
        {assessment.template.sections.map((section) => (
          <section
            key={section.id}
            className="assessment-document-section border-b border-slate-300 py-9 last:border-b-0 md:py-11"
          >
            <div className="mb-7 grid grid-cols-[42px_1fr] gap-3">
              <span className="font-serif text-xl text-[#1d4f7a]">
                {String(section.position).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-serif text-2xl text-slate-950">{section.title}</h2>
                {section.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                )}
              </div>
            </div>

            <dl className="grid gap-6">
              {section.questions
                .filter((q) => q.fieldType !== "summary")
                .map((question) => (
                  <Answer
                    key={question.id}
                    question={question}
                    value={assessment.answers[question.key]}
                    files={assessment.files.filter((f) => f.questionKey === question.key)}
                    isPdfRender={isPdfRender}
                    onFile={onFile}
                  />
                ))}
            </dl>
          </section>
        ))}
      </div>

      {/* Document Footer */}
      <footer className="assessment-document-footer border-t-2 border-slate-800 px-6 py-7 text-xs text-slate-600 md:px-12">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <strong className="block uppercase tracking-wider text-slate-800">GrowXLabs</strong>
            <span>Confidential Client Information</span>
          </div>
          <div className="sm:text-center">
            <span className="block">Assessment Number: {assessment.assessmentNumber || "Not assigned"}</span>
          </div>
          <div className="sm:text-right">
            <span className="block">Generated On: {generated}</span>
            <span className="print-page-number">Page</span>
          </div>
        </div>
      </footer>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="assessment-metadata-item break-inside-avoid">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-slate-900">{value || "Not provided"}</dd>
    </div>
  );
}

function Answer({
  question,
  value,
  files,
  isPdfRender,
  onFile,
}: {
  question: AssessmentQuestion;
  value: AssessmentAnswerValue | undefined;
  files: AssessmentFile[];
  isPdfRender?: boolean;
  onFile?: (file: AssessmentFile) => void;
}) {
  return (
    <div className="assessment-document-answer assessment-field-row grid gap-2 md:grid-cols-[240px_1fr] md:gap-8 break-inside-avoid">
      <dt className="text-sm font-semibold leading-6 text-slate-700">{question.label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere] text-sm leading-7 text-slate-900">
        {question.fieldType === "file_upload" ? (
          files.length ? (
            files.map((file) => (
              <span className="mr-2" key={file.id}>
                {!isPdfRender && onFile ? (
                  <>
                    <button
                      type="button"
                      className="no-print text-[#1d4f7a] underline"
                      onClick={() => onFile(file)}
                    >
                      {file.fileName}
                    </button>
                    <span className="hidden print:inline">{file.fileName}</span>
                  </>
                ) : (
                  <span>{file.fileName}</span>
                )}
              </span>
            ))
          ) : (
            "Not provided"
          )
        ) : (
          renderValue(question, value)
        )}
      </dd>
    </div>
  );
}

function renderValue(question: AssessmentQuestion, value: AssessmentAnswerValue | undefined): ReactNode {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item) => (
          <li key={item}>{question.options?.find((o) => o.value === item)?.label || humanize(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (question.fieldType === "signature") {
    return (
      <div className="signature-block break-inside-avoid inline-block rounded border border-slate-300 bg-slate-50 px-4 py-2 font-serif text-base italic text-slate-900">
        {String(value)}
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <span className="whitespace-pre-wrap">
        {question.options?.find((o) => o.value === value)?.label || humanize(value)}
      </span>
    );
  }

  return String(value);
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function answerText(value: AssessmentAnswerValue | undefined) {
  return typeof value === "string" && value.trim() ? value : "Not provided";
}

function statusLabel(status: string) {
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
