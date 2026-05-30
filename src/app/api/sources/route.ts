import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { createSourceRecord } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    const body = await request.json();
    const source = await createSourceRecord(body, viewer.id);
    const projectId =
      typeof body?.projectId === "string" ? body.projectId : source.projectId;
    revalidatePath(`/projects/${projectId}`, "layout");
    revalidatePath(`/projects/${projectId}/sources`);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/projects", "layout");
    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create source" }, { status: 400 });
  }
}
