import { access } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

type ResolvedCli = {
  command: string;
  argsPrefix: string[];
};

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
      return { command: configured, argsPrefix: [] };
    }

    if (process.platform === "win32" && !configured.endsWith(".cmd")) {
      const withCmd = `${configured}.cmd`;
      if (await pathExists(withCmd)) {
        return { command: withCmd, argsPrefix: [] };
      }
    }
  }

  if (process.platform === "win32") {
    const npmGlobal = path.join(process.env.APPDATA ?? "", "npm", "pixverse.cmd");
    if (await pathExists(npmGlobal)) {
      return { command: npmGlobal, argsPrefix: [] };
    }

    const localAppData = path.join(
      process.env.LOCALAPPDATA ?? "",
      "npm",
      "pixverse.cmd",
    );
    if (localAppData && (await pathExists(localAppData))) {
      return { command: localAppData, argsPrefix: [] };
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
