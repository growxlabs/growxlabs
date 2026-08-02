import type { AssessmentAnswerValue, AssessmentQuestion, AssessmentSection, AssessmentTemplate } from "@/types/assessment";

export type AssessmentValidationError = { questionKey: string; message: string };

function empty(value: AssessmentAnswerValue | undefined) { return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0); }

export function validateQuestion(question: AssessmentQuestion, value: AssessmentAnswerValue | undefined): string | null {
  if (question.required && empty(value)) return "This question is required.";
  if (empty(value)) return null;
  const rules = question.validation;
  if (["multi_select","checkbox"].includes(question.fieldType) && !Array.isArray(value)) return "Select one or more valid options.";
  if (["single_select","radio"].includes(question.fieldType) && typeof value !== "string") return "Select a valid option.";
  if (["boolean","consent"].includes(question.fieldType) && typeof value !== "boolean" && value !== "yes") return "Confirm this field.";
  if (question.options.length) {
    const allowed=new Set(question.options.map((option)=>option.value)); const submitted=Array.isArray(value)?value:[String(value)];
    if(submitted.some((item)=>!allowed.has(item))) return "One or more selected options are invalid.";
  }
  if (typeof value === "string") {
    if (rules.minLength && value.trim().length < rules.minLength) return `Enter at least ${rules.minLength} characters.`;
    if (rules.maxLength && value.length > rules.maxLength) return `Enter no more than ${rules.maxLength} characters.`;
    if (question.fieldType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    if (question.fieldType === "url") { try { new URL(value); } catch { return "Enter a valid URL."; } }
  }
  if (Array.isArray(value)) {
    if (rules.minSelections && value.length < rules.minSelections) return `Select at least ${rules.minSelections} option${rules.minSelections === 1 ? "" : "s"}.`;
    if (rules.maxSelections && value.length > rules.maxSelections) return `Select no more than ${rules.maxSelections} options.`;
    if (rules.conflictsWith?.some((conflict) => value.includes(conflict)) && value.length > 1) return "Remove the contradictory selection.";
  }
  return null;
}

export function validateSection(section: AssessmentSection, answers: Record<string, AssessmentAnswerValue>): AssessmentValidationError[] {
  return section.questions.flatMap((question) => { const message = validateQuestion(question, answers[question.key]); return message ? [{ questionKey: question.key, message }] : []; });
}

export function validateAssessment(template: AssessmentTemplate, answers: Record<string, AssessmentAnswerValue>) {
  return template.sections.flatMap((section) => validateSection(section, answers));
}
