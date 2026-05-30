import { NextResponse } from "next/server";

import { flags } from "@/lib/env";
import { checkPixverseCliAuth } from "@/lib/pixverse-cli";

export async function GET() {
  if (!flags.hasPixverseCli) {
    return NextResponse.json({
      cliEnabled: false,
      authenticated: false,
      message: "Set PIXVERSE_CLI_ENABLED=true to use the local PixVerse CLI.",
    });
  }

  const authenticated = await checkPixverseCliAuth();

  return NextResponse.json({
    cliEnabled: true,
    authenticated,
    usesCliForVideo: flags.usesPixverseCli,
    message: authenticated
      ? "PixVerse CLI is ready."
      : "Run `pixverse auth login` on the machine running Launchly.",
  });
}
