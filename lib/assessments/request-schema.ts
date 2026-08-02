import { z } from "zod";
export const answerValueSchema=z.union([z.string().max(20000),z.number().finite(),z.boolean(),z.array(z.string().max(500)).max(100),z.null()]);
export const answersSchema=z.record(z.string().min(1).max(160),answerValueSchema);
export const draftSchema=z.object({answers:answersSchema,currentSection:z.number().int().min(1).max(100)}).strict();
export const completeSectionSchema=z.object({sectionKey:z.string().min(1).max(160),answers:answersSchema}).strict();
export const submitSchema=z.object({answers:answersSchema}).strict();
