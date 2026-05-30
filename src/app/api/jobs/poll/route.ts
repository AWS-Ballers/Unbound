import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { pollVideoJobs } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json().catch(() => ({ projectId: undefined }));
    const jobs = await pollVideoJobs(projectId);

    if (projectId && typeof projectId === "string") {
      revalidatePath(`/projects/${projectId}`, "layout");
      revalidatePath(`/projects/${projectId}/generate`);
      revalidatePath(`/projects/${projectId}/library`);
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to refresh jobs" }, { status: 400 });
  }
}
