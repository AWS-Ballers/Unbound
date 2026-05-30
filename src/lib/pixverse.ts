import { env, flags } from "@/lib/env";

function makeMockVideo(label: string) {
  const id = `pv_${crypto.randomUUID()}`;
  return {
    id,
    status: "READY" as const,
    outputUrl: `https://storage.example.com/launchly/${label}-${id}.mp4`,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    creditsUsed: 12,
  };
}

async function pixverseFetch(path: string, init: RequestInit) {
  const response = await fetch(`${env.pixverseBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "API-KEY": env.pixverseApiKey ?? "",
      "Ai-trace-id": crypto.randomUUID(),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "PixVerse request failed");
  }

  return response.json();
}

export async function submitTextToVideo(input: {
  prompt: string;
  settings: { durationSeconds: number; aspectRatio: string; style: string };
}) {
  if (!flags.hasPixverse) {
    return makeMockVideo("text2video");
  }

  const result = await pixverseFetch("/openapi/v2/video/text/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt: input.prompt,
      aspect_ratio: input.settings.aspectRatio,
      duration: input.settings.durationSeconds,
      style: input.settings.style,
    }),
  });

  return {
    id: result?.data?.video_id ?? result?.video_id,
    status: "QUEUED" as const,
    outputUrl: null,
    thumbnailUrl: null,
    creditsUsed: 0,
  };
}

export async function pollPixverseVideo(videoId: string) {
  if (!flags.hasPixverse) {
    return makeMockVideo("poll");
  }

  const result = await pixverseFetch(`/openapi/v2/video/result/${videoId}`, {
    method: "GET",
  });

  return {
    id: videoId,
    status: (result?.data?.status ?? result?.status ?? "PROCESSING") as string,
    outputUrl: result?.data?.video_url ?? result?.data?.url ?? null,
    thumbnailUrl: result?.data?.cover_url ?? null,
    creditsUsed: result?.data?.credits_used ?? 0,
  };
}

export async function submitVideoEdit(input: {
  mode: "MODIFY" | "EXTEND" | "TRANSITION";
  prompt: string;
  sourceUrl: string;
}) {
  if (!flags.hasPixverse) {
    return makeMockVideo(input.mode.toLowerCase());
  }

  const pathMap = {
    MODIFY: "/openapi/v2/video/modify/generate",
    EXTEND: "/openapi/v2/video/extend/generate",
    TRANSITION: "/openapi/v2/video/transition/generate",
  } as const;

  const result = await pixverseFetch(pathMap[input.mode], {
    method: "POST",
    body: JSON.stringify({
      prompt: input.prompt,
      source_url: input.sourceUrl,
    }),
  });

  return {
    id: result?.data?.video_id ?? result?.video_id,
    status: "QUEUED" as const,
    outputUrl: null,
    thumbnailUrl: null,
    creditsUsed: 0,
  };
}
