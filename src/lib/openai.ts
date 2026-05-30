import OpenAI from "openai";

import {
  briefDataSchema,
  sourceSummarySchema,
  templateRecommendationSchema,
  type BriefData,
} from "@/lib/contracts";
import { env, flags } from "@/lib/env";
import { templateCatalog } from "@/lib/templates";

const client = flags.hasOpenAi ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain JSON");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

async function complete(system: string, user: string) {
  if (!client) {
    return null;
  }

  const completion = await client.chat.completions.create({
    model: env.openAiModel,
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return completion.choices[0]?.message?.content ?? null;
}

export async function summarizeSourceWithOpenAi(input: {
  type: "FILE" | "GITHUB" | "WEBSITE" | "TEXT";
  rawLocation: string;
  content: string;
}) {
  const fallback = {
    productName: "Launchly Project",
    oneSentenceSummary:
      input.content.slice(0, 140) || `Source summary from ${input.rawLocation}`,
    keyFeatures: ["Fast source ingestion", "Structured summaries"],
    targetAudience: "Product and growth teams",
    toneHints: ["confident", "modern"],
    visualHints: ["cinematic UI", "clean gradients"],
    rawTextExcerpt: input.content.slice(0, 220),
    sourceKind: input.type,
  } as const;

  const response = await complete(
    "You are a product analyst extracting structured facts about a digital product from mixed sources. Return strict JSON only.",
    `Given this input, extract productName, oneSentenceSummary, keyFeatures, targetAudience, toneHints, visualHints, rawTextExcerpt, sourceKind.\n\nSOURCE TYPE: ${input.type}\nSOURCE LOCATION: ${input.rawLocation}\n\nCONTENT:\n${input.content.slice(0, 12000)}`,
  );

  if (!response) {
    return sourceSummarySchema.parse(fallback);
  }

  try {
    return sourceSummarySchema.parse(extractJson(response));
  } catch {
    return sourceSummarySchema.parse(fallback);
  }
}

export async function generateBriefWithOpenAi(input: {
  summaries: unknown[];
  manualDescription?: string;
}) {
  const fallback: BriefData = {
    productName: "Launchly Product",
    tagline: "Turn product context into launch-ready video",
    productCategory: "Marketing workflow",
    keyFeatures: [
      "Source ingestion",
      "Brief generation",
      "Video prompt engineering",
    ],
    valueProposition:
      "Launchly compresses product research, creative direction, and video generation into a single workflow.",
    targetAudience: "Startup founders, product marketers, and launch teams",
    toneOfVoice: "Confident, cinematic, polished",
    visualStyle: "Clean premium UI, high-contrast lighting, editorial motion",
    primaryCTA: "Generate a launch video",
    differentiators: [
      "AI-generated briefs",
      "Template recommendations",
      "PixVerse-ready prompts",
    ],
  };

  const response = await complete(
    "You are a senior product marketer. Merge multiple noisy product summaries into a clean, concise launch brief. Return strict JSON only.",
    `Given these JSON summaries, produce a single JSON brief with the schema Brief.data.\n\nSUMMARIES:\n${JSON.stringify(input.summaries, null, 2)}\n\nMANUAL DESCRIPTION:\n${input.manualDescription ?? ""}`,
  );

  if (!response) {
    return briefDataSchema.parse(fallback);
  }

  try {
    return briefDataSchema.parse(extractJson(response));
  } catch {
    return briefDataSchema.parse(fallback);
  }
}

export async function recommendTemplatesWithOpenAi(input: {
  brief: BriefData;
  channelHints?: string[];
}) {
  const fallback = templateCatalog.slice(0, 3).map((template, index) => ({
    templateKey: template.key,
    confidence: [0.93, 0.87, 0.79][index] ?? 0.7,
    reasoning:
      index === 0
        ? "Best overall match for a premium launch reveal with strong product contrast."
        : index === 1
          ? "Good option if the team wants broader brand-market storytelling."
          : "Balances clarity and cinematic polish for more educational messaging.",
  }));

  const response = await complete(
    'You are a creative director choosing the best video template for a product launch. Return strict JSON only as {"items": [...]}.',
    `Given this brief JSON, return top 3 templates from the fixed list with confidence and explanation.\n\nTEMPLATE LIST: ${templateCatalog.map((item) => item.name).join(", ")}\n\nBRIEF:\n${JSON.stringify(input.brief, null, 2)}\n\nCHANNEL HINTS: ${(input.channelHints ?? []).join(", ")}`,
  );

  if (!response) {
    return fallback;
  }

  try {
    const parsed = extractJson(response) as { items?: unknown[] };
    return (parsed.items ?? [])
      .slice(0, 3)
      .map((item) => templateRecommendationSchema.parse(item));
  } catch {
    return fallback;
  }
}

export async function buildPixversePrompt(input: {
  brief: BriefData;
  templateName: string;
  templateStyle: string;
  overrides?: string;
}) {
  const fallback = [
    `Create a premium launch film for ${input.brief.productName}.`,
    `Tagline: ${input.brief.tagline}.`,
    `Template: ${input.templateName}.`,
    `Show ${input.brief.keyFeatures.slice(0, 3).join(", ")}.`,
    `Environment: ${input.brief.visualStyle}.`,
    `Tone: ${input.brief.toneOfVoice}.`,
    "Lighting: cinematic, high contrast, polished reflections.",
    "Camera: fluid dolly shots, macro detail reveals, confident movement.",
    input.overrides ? `Extra direction: ${input.overrides}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const response = await complete(
    "You are a creative prompt engineer specializing in PixVerse cinematic video generation. Output a single English prompt string only.",
    `Given this brief JSON and chosen template, output a single English prompt string describing the video we want, including subject, environment, camera movement, lighting, and mood.\n\nBRIEF:\n${JSON.stringify(input.brief, null, 2)}\n\nTEMPLATE: ${input.templateName}\nSTYLE GUIDELINES: ${input.templateStyle}\nOVERRIDES: ${input.overrides ?? "None"}`,
  );

  return response?.trim() || fallback;
}
