import { generateImageAsset, generateVideoJob } from "@/server/generation";

export type ChatGenerationResult =
  | { kind: "image"; label: string; outputUrl?: string | null }
  | { kind: "video"; label: string; status: string }
  | null;

function wantsImage(message: string) {
  const text = message.toLowerCase();
  return (
    /\b(generate|create|make|produce|render)\b/.test(text) &&
    /\b(image|images|still|stills|photo|poster|concept)\b/.test(text)
  );
}

function wantsVideo(message: string) {
  const text = message.toLowerCase();
  return (
    /\b(generate|create|make|produce|render)\b/.test(text) &&
    /\b(video|videos|clip|clips|motion|film)\b/.test(text)
  );
}

export async function tryWorkspaceGenerationFromChat(
  projectId: string,
  message: string,
  context: {
    projectName: string;
    templateKey?: string | null;
    defaultTemplateKey: string;
  },
): Promise<ChatGenerationResult> {
  if (wantsImage(message)) {
    const direction =
      message.length > 80
        ? message
        : `Create a premium campaign image for ${context.projectName} using the current workspace context.`;

    const result = await generateImageAsset({
      projectId,
      templateKey: context.templateKey ?? undefined,
      prompt: direction,
      kind: "GENERATED",
      size: "landscape_16_9",
    });

    const image = "image" in result ? result.image : null;
    return {
      kind: "image",
      label: image?.label ?? "Generated image",
      outputUrl: image?.outputUrl ?? result.job?.outputUrl ?? null,
    };
  }

  if (wantsVideo(message)) {
    const templateKey = context.templateKey ?? context.defaultTemplateKey;
    const result = await generateVideoJob({
      projectId,
      templateKey,
      settings: { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" },
    });

    return {
      kind: "video",
      label: "Launch video",
      status: result.job?.status ?? "QUEUED",
    };
  }

  return null;
}
