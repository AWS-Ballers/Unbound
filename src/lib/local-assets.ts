import { access } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

function extractAppAssetPath(urlOrPath: string) {
  const trimmed = urlOrPath.trim();

  if (trimmed.startsWith("/generated/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/generated/")) {
      return parsed.pathname;
    }
  } catch {
    // Not a URL — fall through.
  }

  return null;
}

export async function resolvePixverseVideoInput(sourceUrl: string) {
  const trimmed = sourceUrl.trim();

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  if (/^https:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^(upload\/|oss\/)/i.test(trimmed)) {
    return trimmed;
  }

  const appPath = extractAppAssetPath(trimmed);
  if (appPath) {
    const absolutePath = path.join(process.cwd(), "public", appPath.replace(/^\//, ""));

    try {
      await access(absolutePath);
      return absolutePath;
    } catch {
      throw new Error(`Video file not found on disk: ${absolutePath}`);
    }
  }

  if (path.isAbsolute(trimmed)) {
    try {
      await access(trimmed);
      return trimmed;
    } catch {
      throw new Error(`Video file not found: ${trimmed}`);
    }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    throw new Error(
      "Local or private URLs cannot be sent to PixVerse. Choose a workspace clip saved under /generated, or paste a public HTTPS video URL.",
    );
  }

  throw new Error(
    `Unsupported video input "${trimmed}". Choose a workspace clip, a public HTTPS URL, or a PixVerse video ID.`,
  );
}

export async function resolvePixverseImageInput(sourceUrl: string) {
  return resolvePixverseVideoInput(sourceUrl);
}

function extensionFromContentType(contentType: string | null) {
  if (!contentType) {
    return ".bin";
  }
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("mp4")) return ".mp4";
  return ".bin";
}

export async function persistRemoteAsset(remoteUrl: string, prefix: string) {
  const response = await fetch(remoteUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to download generated asset (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = extensionFromContentType(response.headers.get("content-type"));
  const filename = `${prefix}-${crypto.randomUUID()}${extension}`;

  await mkdir(GENERATED_DIR, { recursive: true });
  await writeFile(path.join(GENERATED_DIR, filename), buffer);

  return `/generated/${filename}`;
}
