import { z } from "zod";

export const projectCategories = ["SAAS", "FINANCE", "COMMERCE", "INTERNAL", "OTHER"] as const;
export const sourceTypes = ["FILE", "GITHUB", "WEBSITE", "TEXT"] as const;
export const sourceStatuses = ["PENDING", "SCANNING", "INDEXED", "FAILED"] as const;
export const videoJobModes = ["TEXT2VIDEO", "IMG2VIDEO", "TRANSITION", "EXTEND", "MODIFY", "SOUND"] as const;
export const videoJobStatuses = ["QUEUED", "PROCESSING", "READY", "FAILED"] as const;
export const clipTags = ["HERO", "BROLL", "INTRO", "OUTRO", "SOCIAL", "FULL"] as const;
export const publishStatuses = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED"] as const;

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

export const sourceCreateSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(sourceTypes),
  rawLocation: z.string().min(1),
  content: z.string().optional(),
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
  overrides: z.string().optional(),
  settings: z
    .object({
      durationSeconds: z.number().min(4).max(60).default(12),
      aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
      style: z.string().default("Cinematic"),
    })
    .default({ durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" }),
});

export const pollJobsSchema = z.object({
  projectId: z.string().optional(),
});

export const studioActionSchema = z.object({
  clipId: z.string().min(1),
  instructions: z.string().min(4),
  projectId: z.string().optional(),
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
