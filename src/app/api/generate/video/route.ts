import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { generateVideoJob } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = await generateVideoJob(body);
    const projectId = typeof body?.projectId === "string" ? body.projectId : payload.job.projectId;

    revalidatePath(`/projects/${projectId}`, "layout");
    revalidatePath(`/projects/${projectId}/generate`);
    revalidatePath(`/projects/${projectId}/library`);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate video" }, { status: 400 });
  }
}
