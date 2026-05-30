import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { flags } from "@/lib/env";
import { getDemoGitHubInspection, inspectGitHubRepoForViewer } from "@/server/github";

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    const body = await request.json();

    if (flags.isDemoMode) {
      const repoUrl = typeof body?.repoUrl === "string" ? body.repoUrl : "";
      return NextResponse.json({
        inspection: getDemoGitHubInspection(repoUrl),
        auth: { linked: true, usingToken: false },
      });
    }

    const { getGitHubAccessTokenForViewer } = await import("@/server/github");
    const [inspection, linked] = await Promise.all([
      inspectGitHubRepoForViewer(viewer.id, body),
      getGitHubAccessTokenForViewer(viewer.id),
    ]);

    return NextResponse.json({
      inspection,
      auth: {
        linked: Boolean(linked),
        usingToken: Boolean(linked),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to inspect repository" },
      { status: 400 },
    );
  }
}
