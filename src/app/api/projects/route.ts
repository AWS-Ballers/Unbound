import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { createProjectForViewer, listProjectsForViewer } from "@/server/projects";

export async function GET() {
  const viewer = await getViewer();
  const projects = await listProjectsForViewer(viewer.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    const project = await createProjectForViewer(viewer.id, await request.json());
    revalidatePath("/projects", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath(`/projects/${project.id}`, "layout");
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create project" }, { status: 400 });
  }
}
