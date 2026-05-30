import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { env } from "@/lib/env";
import { persistRemoteAsset } from "@/lib/local-assets";
import { formatPixverseCliSetupHelp, resolvePixverseCli } from "@/lib/resolve-pixverse-cli";

const execFileAsync = promisify(execFile);

const IMAGE_SIZE_TO_ASPECT: Record<string, string> = {
  square_hd: "1:1",
  square: "1:1",
  portrait_4_3: "3:4",
  portrait_16_9: "9:16",
  landscape_4_3: "4:3",
  landscape_16_9: "16:9",
};

type CliJson = Record<string, unknown>;

function parseCliJson(stdout: string) {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error("PixVerse CLI returned empty output");
  }

  try {
    return JSON.parse(trimmed) as CliJson;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error(`PixVerse CLI did not return JSON: ${trimmed.slice(0, 400)}`);
    }
    return JSON.parse(trimmed.slice(start, end + 1)) as CliJson;
  }
}

async function runPixverseCli(args: string[]) {
  const { command, argsPrefix } = await resolvePixverseCli();

  try {
    const { stdout, stderr } = await execFileAsync(command, [...argsPrefix, ...args], {
      timeout: env.pixverseCliTimeoutMs,
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    });

    if (stderr?.trim()) {
      console.warn("[pixverse-cli]", stderr.trim());
    }

    return parseCliJson(stdout);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw new Error(formatPixverseCliSetupHelp());
    }
    throw error;
  }
}

function readString(data: CliJson, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return null;
}

function readId(data: CliJson, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }
  return null;
}

function normalizeJobStatus(status: string | null) {
  const value = (status ?? "PROCESSING").toUpperCase();
  if (value === "COMPLETED" || value === "SUCCESS" || value === "READY" || value === "SUCCEEDED") {
    return "READY" as const;
  }
  if (value === "FAILED" || value === "ERROR") {
    return "FAILED" as const;
  }
  if (value === "QUEUED" || value === "PENDING") {
    return "QUEUED" as const;
  }
  return "PROCESSING" as const;
}

async function maybePersist(url: string | null, prefix: string) {
  if (!url || !env.pixversePersistAssets) {
    return url;
  }

  return persistRemoteAsset(url, prefix);
}

export async function createImageViaCli(input: {
  prompt: string;
  size?: string;
  sourceImagePath?: string;
}) {
  const aspectRatio = IMAGE_SIZE_TO_ASPECT[input.size ?? "landscape_16_9"] ?? "16:9";
  const args = [
    "create",
    "image",
    "--prompt",
    input.prompt,
    "--aspect-ratio",
    aspectRatio,
    "--json",
  ];

  if (env.pixverseImageModel) {
    args.push("--model", env.pixverseImageModel);
  }

  if (env.pixverseImageQuality) {
    args.push("--quality", env.pixverseImageQuality);
  }

  if (input.sourceImagePath) {
    args.push("--image", input.sourceImagePath);
  }

  const result = await runPixverseCli(args);
  const remoteUrl = readString(result, ["image_url", "url", "output_url"]);
  const status = normalizeJobStatus(readString(result, ["status"]));
  const id = readId(result, ["image_id", "id", "task_id"]);

  if (!remoteUrl && status !== "QUEUED" && status !== "PROCESSING") {
    throw new Error(`PixVerse image CLI missing image_url: ${JSON.stringify(result)}`);
  }

  const outputUrl = remoteUrl ? await maybePersist(remoteUrl, "image") : null;

  return {
    id: id ?? `pv_img_${crypto.randomUUID()}`,
    status,
    outputUrl,
    thumbnailUrl: outputUrl,
    creditsUsed: 0,
  };
}

export async function submitTextToVideoViaCli(input: {
  prompt: string;
  settings: { durationSeconds: number; aspectRatio: string; style: string };
  sourceImagePath?: string;
}) {
  const args = [
    "create",
    "video",
    "--prompt",
    input.prompt,
    "--aspect-ratio",
    input.settings.aspectRatio,
    "--duration",
    String(input.settings.durationSeconds),
    "--json",
  ];

  if (env.pixverseVideoModel) {
    args.push("--model", env.pixverseVideoModel);
  }

  if (input.sourceImagePath) {
    args.push("--image", input.sourceImagePath);
  }

  const result = await runPixverseCli(args);
  const remoteUrl = readString(result, ["video_url", "url", "output_url"]);
  const id = readId(result, ["video_id", "id", "task_id"]) ?? `pv_vid_${crypto.randomUUID()}`;
  const status = normalizeJobStatus(readString(result, ["status"]));
  const outputUrl = remoteUrl ? await maybePersist(remoteUrl, "video") : null;

  return {
    id,
    status: outputUrl ? ("READY" as const) : status === "READY" ? ("QUEUED" as const) : status,
    outputUrl,
    thumbnailUrl: readString(result, ["cover_url", "thumbnail_url", "thumbnailUrl"]) ?? outputUrl,
    creditsUsed: 0,
  };
}

export async function pollVideoViaCli(videoId: string) {
  const result = await runPixverseCli(["task", "status", videoId, "--json"]);
  const remoteUrl = readString(result, ["video_url", "url", "output_url"]);
  const status = normalizeJobStatus(readString(result, ["status"]));
  const outputUrl = remoteUrl ? await maybePersist(remoteUrl, "video") : null;

  return {
    id: videoId,
    status,
    outputUrl,
    thumbnailUrl: readString(result, ["cover_url", "thumbnail_url"]) ?? outputUrl,
    creditsUsed: 0,
  };
}

export async function submitVideoEditViaCli(input: {
  mode: "MODIFY" | "EXTEND" | "TRANSITION";
  prompt: string;
  sourceUrl: string;
}) {
  const commandMap = {
    MODIFY: "modify",
    EXTEND: "extend",
    TRANSITION: "transition",
  } as const;

  const args = [
    "create",
    commandMap[input.mode],
    "--prompt",
    input.prompt,
    "--video",
    input.sourceUrl,
    "--json",
  ];

  const result = await runPixverseCli(args);
  const remoteUrl = readString(result, ["video_url", "url", "output_url"]);
  const id = readId(result, ["video_id", "id", "task_id"]) ?? `pv_edit_${crypto.randomUUID()}`;
  const status = normalizeJobStatus(readString(result, ["status"]));
  const outputUrl = remoteUrl ? await maybePersist(remoteUrl, "video") : null;

  return {
    id,
    status: outputUrl ? ("READY" as const) : status === "READY" ? ("QUEUED" as const) : status,
    outputUrl,
    thumbnailUrl: readString(result, ["cover_url", "thumbnail_url"]) ?? outputUrl,
    creditsUsed: 0,
  };
}

export async function checkPixverseCliAuth() {
  try {
    const result = await runPixverseCli(["auth", "status", "--json"]);
    const authenticated = result.authenticated ?? result.logged_in ?? result.status === "authenticated";
    return Boolean(authenticated);
  } catch {
    return false;
  }
}
