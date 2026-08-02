export type AssessmentTemplateStatus = "draft" | "published" | "archived";
export type ClientAssessmentStatus = "not_started" | "draft" | "submitted" | "under_review" | "more_information_required" | "review_complete" | "archived";
export type AssessmentFieldType = "text" | "textarea" | "email" | "phone" | "number" | "currency" | "date" | "url" | "single_select" | "multi_select" | "radio" | "checkbox" | "boolean" | "file_upload" | "signature" | "consent" | "summary";

export type AssessmentValidation = {
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
  min?: number;
  max?: number;
  conflictsWith?: string[];
  allowedMimeTypes?: string[];
  maxFileSize?: number;
};

export type AssessmentVisibilityRule = { questionKey: string; operator: "equals" | "not_equals" | "contains"; value: string | boolean };
export type AssessmentOption = { id: string; label: string; value: string; position: number; metadata: Record<string, unknown> };
export type AssessmentQuestion = { id: string; key: string; label: string; description: string | null; fieldType: AssessmentFieldType; placeholder: string | null; helpText: string | null; position: number; required: boolean; validation: AssessmentValidation; visibilityRules: AssessmentVisibilityRule[]; config: Record<string, unknown>; options: AssessmentOption[] };
export type AssessmentSection = { id: string; key: string; title: string; description: string | null; position: number; required: boolean; config: Record<string, unknown>; questions: AssessmentQuestion[] };
export type AssessmentTemplate = { id: string; name: string; slug: string; description: string | null; version: number; status: AssessmentTemplateStatus; sections: AssessmentSection[] };
export type AssessmentAnswerValue = string | number | boolean | string[] | null;
export type AssessmentAnswer = { questionId: string | null; questionKey: string; value: AssessmentAnswerValue; updatedAt?: string };
export type AssessmentFile = { id: string; questionId: string | null; questionKey: string | null; fileName: string; fileType: string | null; fileSize: number | null; createdAt: string };
export type AssessmentInformationRequest = { id: string; message: string; requestedQuestionKeys: string[]; requestedSectionKeys: string[]; status: "open" | "answered" | "resolved" | "cancelled"; dueAt: string | null; createdAt: string };
export type ClientAssessment = { id: string; templateId: string; templateVersion: number; status: ClientAssessmentStatus; currentSection: number; completedSections: string[]; completionPercentage: number; template: AssessmentTemplate; answers: Record<string, AssessmentAnswerValue>; files: AssessmentFile[]; informationRequests: AssessmentInformationRequest[]; startedAt: string | null; submittedAt: string | null; updatedAt: string };
export type AssessmentReview = { id: string; assessmentId: string; reviewerId: string; status: string; summary: string | null; missingInformation: string | null; immediateOpportunities: string[]; mediumTermOpportunities: string[]; longTermOpportunities: string[]; risks: string[]; recommendedNextAction: string | null; internalNotes: string | null };
