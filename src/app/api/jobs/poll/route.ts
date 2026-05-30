import { NextResponse } from "next/server";

import { pollVideoJobs } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json().catch(() => ({ projectId: undefined }));
    const jobs = await pollVideoJobs(projectId);
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to refresh jobs" }, { status: 400 });
  }
}
