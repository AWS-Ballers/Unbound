import { execFile } from "node:child_process";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { templateCatalog } from "../src/lib/templates";

const execFileAsync = promisify(execFile);
const OUTPUT_DIR = path.join(process.cwd(), "public", "templates");
const force = process.argv.includes("--force");

function resolvePixverseCli(): { command: string; prefixArgs: string[] } {
  const configured = process.env.PIXVERSE_CLI_PATH?.trim();
  if (configured && configured !== "pixverse") {
    return { command: configured, prefixArgs: [] };
  }

  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    if (appData) {
      const entry = path.join(appData, "npm", "node_modules", "pixverse", "dist", "index.js");
      return { command: process.execPath, prefixArgs: [entry] };
    }
  }

  return { command: "pixverse", prefixArgs: [] };
}

const PIXVERSE_CLI = resolvePixverseCli();

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateImageUrl(prompt: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const { stdout } = await execFileAsync(
        PIXVERSE_CLI.command,
        [
          ...PIXVERSE_CLI.prefixArgs,
          "create",
          "image",
          "--prompt",
          prompt,
          "--aspect-ratio",
          "16:9",
          "--json",
        ],
        { timeout: 600_000, maxBuffer: 16 * 1024 * 1024, windowsHide: true },
      );

      const parsed = JSON.parse(stdout.trim()) as { image_url?: string; error?: string };
      if (parsed.image_url) {
        return parsed.image_url;
      }

      throw new Error(parsed.error ?? `PixVerse CLI missing image_url: ${stdout.slice(0, 400)}`);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.warn(`retry ${attempt}/${attempts - 1} after failure`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  throw lastError;
}

async function downloadImage(url: string, dest: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  await writeFile(dest, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const template of templateCatalog) {
    const dest = path.join(OUTPUT_DIR, `${template.key}.png`);

    if (!force && (await fileExists(dest))) {
      console.log(`skip ${template.key} (exists)`);
      continue;
    }

    console.log(`generating ${template.key}...`);
    try {
      const imageUrl = await generateImageUrl(template.posterPrompt);
      await downloadImage(imageUrl, dest);
      console.log(`saved ${template.key} -> /templates/${template.key}.png`);
    } catch (error) {
      console.error(`failed ${template.key}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
