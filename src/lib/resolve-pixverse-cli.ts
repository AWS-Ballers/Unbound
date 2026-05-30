import { access } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

type ResolvedCli = {
  command: string;
  argsPrefix: string[];
};

function isWindowsBatch(command: string) {
  const lower = command.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".bat");
}

/** execFile cannot spawn .cmd/.bat directly on Windows (EINVAL). */
function wrapWindowsBatch(command: string): ResolvedCli {
  return {
    command: process.env.ComSpec ?? "cmd.exe",
    argsPrefix: ["/d", "/s", "/c", command],
  };
}

async function resolveFromCmdPath(cmdPath: string): Promise<ResolvedCli> {
  if (process.platform === "win32") {
    const indexJs = path.join(
      path.dirname(cmdPath),
      "node_modules",
      "pixverse",
      "dist",
      "index.js",
    );
    if (await pathExists(indexJs)) {
      return { command: process.execPath, argsPrefix: [indexJs] };
    }

    return wrapWindowsBatch(cmdPath);
  }

  return { command: cmdPath, argsPrefix: [] };
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Node's execFile cannot run bare `pixverse` on Windows — npm installs `pixverse.cmd`.
 */
export async function resolvePixverseCli(): Promise<ResolvedCli> {
  const configured = env.pixverseCliPath.trim();

  if (configured && configured !== "pixverse") {
    if (await pathExists(configured)) {
      if (isWindowsBatch(configured)) {
        return resolveFromCmdPath(configured);
      }
      return { command: configured, argsPrefix: [] };
    }

    if (process.platform === "win32" && !isWindowsBatch(configured)) {
      const withCmd = `${configured}.cmd`;
      if (await pathExists(withCmd)) {
        return resolveFromCmdPath(withCmd);
      }
    }
  }

  if (process.platform === "win32") {
    const npmGlobal = path.join(process.env.APPDATA ?? "", "npm", "pixverse.cmd");
    if (await pathExists(npmGlobal)) {
      return resolveFromCmdPath(npmGlobal);
    }

    const localAppData = path.join(
      process.env.LOCALAPPDATA ?? "",
      "npm",
      "pixverse.cmd",
    );
    if (localAppData && (await pathExists(localAppData))) {
      return resolveFromCmdPath(localAppData);
    }

    return {
      command: process.env.ComSpec ?? "cmd.exe",
      argsPrefix: ["/d", "/s", "/c", "pixverse"],
    };
  }

  return { command: "pixverse", argsPrefix: [] };
}

export function formatPixverseCliSetupHelp() {
  const npmGlobal =
    process.platform === "win32"
      ? path.join(process.env.APPDATA ?? "%APPDATA%", "npm", "pixverse.cmd")
      : "pixverse";

  return [
    "PixVerse CLI was not found on this machine.",
    "Install: npm install -g pixverse",
    "Then run: pixverse auth login",
    process.platform === "win32"
      ? `Set PIXVERSE_CLI_PATH=${npmGlobal} in launchly/.env`
      : "Set PIXVERSE_CLI_PATH=pixverse in launchly/.env",
  ].join(" ");
}
