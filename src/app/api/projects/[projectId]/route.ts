import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { getProjectWorkspace, updateProjectForViewer } from "@/server/projects";

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const viewer = await getViewer();
    const { projectId } = await context.params;
    const workspace = await getProjectWorkspace(projectId, viewer.id);
    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const viewer = await getViewer();
    const { projectId } = await context.params;
    const project = await updateProjectForViewer(viewer.id, projectId, await request.json());
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update project" }, { status: 400 });
  }
}
