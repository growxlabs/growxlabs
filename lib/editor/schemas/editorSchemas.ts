import { z } from "zod";

// Text Layer Properties Validation
export const TextLayerPropertiesSchema = z.object({
  text: z.string().max(20000).optional(),
  fontFamily: z.string().min(1).max(120).optional(),
  fontSize: z.number().min(1).max(1000).optional(),
  fontWeight: z.string().max(20).optional(),
  lineHeight: z.number().min(0.1).max(10).optional(),
  letterSpacing: z.number().min(-100).max(100).optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  uppercase: z.boolean().optional(),
  color: z.string().max(50).optional(),
});

// Image Layer Properties Validation
export const ImageLayerPropertiesSchema = z.object({
  mediaUrl: z.string().max(2000).optional(),
  logoUrl: z.string().max(2000).optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
  brightness: z.number().min(0).max(300).optional(),
  contrast: z.number().min(0).max(300).optional(),
  borderRadius: z.number().min(0).max(500).optional(),
  borderWidth: z.number().min(0).max(100).optional(),
  borderColor: z.string().max(50).optional(),
  shadowEnabled: z.boolean().optional(),
});

// Bullet Layer Properties Validation
export const BulletLayerPropertiesSchema = z.object({
  bulletStyle: z.enum(["check", "dot", "number"]).optional(),
  spacing: z.number().min(0).max(100).optional(),
  items: z.array(z.string().max(500)).optional(),
});

// Quote Layer Properties Validation
export const QuoteLayerPropertiesSchema = z.object({
  text: z.string().max(5000).optional(),
  author: z.string().max(200).optional(),
  backgroundColor: z.string().max(50).optional(),
  borderColor: z.string().max(50).optional(),
  borderRadius: z.number().min(0).max(100).optional(),
});

// CTA Layer Properties Validation
export const CtaLayerPropertiesSchema = z.object({
  text: z.string().max(200).optional(),
  link: z.string().max(1000).optional(),
  backgroundColor: z.string().max(50).optional(),
  textColor: z.string().max(50).optional(),
  borderRadius: z.number().min(0).max(100).optional(),
});

// Generic Layer Properties Union/Fallback Schema
export const LayerPropertiesSchema = z.record(z.string(), z.any());

// Batch Operation Item Schema
export const BatchOperationItemSchema = z.object({
  clientOperationId: z.string().min(1),
  type: z.string().min(1),
  entityType: z.enum(["document", "slide", "layer"]),
  entityId: z.string().optional(),
  changes: z.record(z.string(), z.any()),
  inverseChanges: z.record(z.string(), z.any()).optional(),
});

// Batch Operation Payload Schema
export const BatchOperationsSchema = z.object({
  baseVersion: z.number().min(1),
  operations: z.array(BatchOperationItemSchema).min(1),
});

// Export Request Schema
export const ExportRequestSchema = z.object({
  exportType: z.enum(["png", "jpeg", "svg", "pdf", "mp4"]),
  slideIndex: z.number().min(0).optional(),
  options: z.record(z.string(), z.any()).optional(),
});
