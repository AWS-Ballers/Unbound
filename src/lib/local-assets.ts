import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

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
