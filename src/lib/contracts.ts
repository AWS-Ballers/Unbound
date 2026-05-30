import { z } from "zod";

import { chatReferenceSchema } from "@/lib/chat-references";

export const projectCategories = ["SAAS", "FINANCE", "COMMERCE", "INTERNAL", "OTHER"] as const;
export const sourceTypes = ["FILE", "GITHUB", "WEBSITE", "TEXT"] as const;
export const sourceStatuses = ["PENDING", "SCANNING", "INDEXED", "FAILED"] as const;
export const videoJobModes = ["TEXT2VIDEO", "IMG2VIDEO", "TRANSITION", "EXTEND", "MODIFY", "SOUND"] as const;
export const videoJobStatuses = ["QUEUED", "PROCESSING", "READY", "FAILED"] as const;
export const assetJobStatuses = ["QUEUED", "PROCESSING", "READY", "FAILED"] as const;
export const clipTags = ["HERO", "BROLL", "INTRO", "OUTRO", "SOCIAL", "FULL"] as const;
export const publishStatuses = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED"] as const;
export const imageAssetKinds = ["GENERATED", "REFERENCE", "COVER"] as const;
export const chatRoles = ["USER", "ASSISTANT", "SYSTEM"] as const;

export const templateSettingsSchema = z.object({
  templateKey: z.string().min(1),
  posterUrl: z.string().url().optional(),
  posterPrompt: z.string().optional(),
  style: z.string().optional(),
});

export const videoDurationOptions = [5, 8, 10, 12, 15] as const;

export function normalizeVideoDuration(seconds: number) {
  return (videoDurationOptions as readonly number[]).includes(seconds)
    ? (seconds as (typeof videoDurationOptions)[number])
    : 12;
}

export const generationDefaultsSchema = z.object({
  durationSeconds: z.number().min(4).max(60).default(12),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  style: z.string().default("Cinematic"),
});

export const sourceSummarySchema = z.object({
  productName: z.string().optional(),
  oneSentenceSummary: z.string().optional(),
  keyFeatures: z.array(z.string()).default([]),
  targetAudience: z.string().optional(),
  toneHints: z.array(z.string()).default([]),
  visualHints: z.array(z.string()).default([]),
  rawTextExcerpt: z.string().optional(),
  sourceKind: z.enum(sourceTypes),
});

export const briefDataSchema = z.object({
  productName: z.string().min(1),
  tagline: z.string().min(1),
  productCategory: z.string().min(1),
  keyFeatures: z.array(z.string()).min(1),
  valueProposition: z.string().min(1),
  targetAudience: z.string().min(1),
  toneOfVoice: z.string().min(1),
  visualStyle: z.string().min(1),
  primaryCTA: z.string().min(1),
  differentiators: z.array(z.string()).min(1),
});

export const templateRecommendationSchema = z.object({
  templateKey: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
});

export const projectCreateSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(240).optional().or(z.literal("")),
  category: z.enum(projectCategories),
});

export const projectUpdateSchema = z.object({
  activeTemplateKey: z.string().min(1).optional(),
  templateSettings: templateSettingsSchema.optional(),
  generationDefaults: generationDefaultsSchema.optional(),
});

export const sourceCreateSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(sourceTypes),
  rawLocation: z.string().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const briefGenerateSchema = z.object({
  projectId: z.string().min(1),
  manualDescription: z.string().optional(),
});

export const briefUpdateSchema = briefDataSchema.partial();

export const templateRecommendSchema = z.object({
  projectId: z.string().min(1),
  channelHints: z.array(z.string()).optional(),
});

export const videoGenerateSchema = z.object({
  projectId: z.string().min(1),
  templateKey: z.string().min(1),
  sourceImageAssetId: z.string().optional(),
  overrides: z.string().optional(),
  settings: generationDefaultsSchema.default({ durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" }),
});

export const imageGenerateSchema = z.object({
  projectId: z.string().min(1),
  templateKey: z.string().min(1).optional(),
  prompt: z.string().min(4),
  kind: z.enum(imageAssetKinds).default("GENERATED"),
  size: z.enum(["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]).default("landscape_16_9"),
});

export const pollJobsSchema = z.object({
  projectId: z.string().optional(),
});

export const studioActionSchema = z.object({
  clipId: z.string().min(1).optional(),
  inputUrl: z.string().url().optional(),
  instructions: z.string().min(4),
  projectId: z.string().optional(),
});

export const chatRequestSchema = z.object({
  projectId: z.string().min(1),
  threadId: z.string().optional(),
  message: z.string().min(2),
  references: z.array(chatReferenceSchema).max(12).optional(),
});

export const publishCreateSchema = z.object({
  projectId: z.string().min(1),
  clipIds: z.array(z.string()).min(1),
  publicTitle: z.string().optional(),
  publicDescription: z.string().optional(),
});

export type BriefData = z.infer<typeof briefDataSchema>;
export type SourceSummary = z.infer<typeof sourceSummarySchema>;

const briefKeys = Object.keys(briefDataSchema.shape) as (keyof BriefData)[];

export function calculateCompletenessScore(data: Partial<BriefData>) {
  const filled = briefKeys.filter((key) => {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value);
  }).length;

  return Math.round((filled / briefKeys.length) * 100);
}
