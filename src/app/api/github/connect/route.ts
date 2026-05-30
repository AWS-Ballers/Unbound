import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getViewer } from "@/lib/auth";
import { connectGitHubRepoToProject } from "@/server/github";

const connectSchema = z.object({
  projectId: z.string().min(1),
  repoUrl: z.string().min(8),
  title: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    const parsed = connectSchema.parse(await request.json());
    const source = await connectGitHubRepoToProject(
      viewer.id,
      parsed.projectId,
      parsed.repoUrl,
      parsed.title,
    );

    revalidatePath(`/projects/${parsed.projectId}`, "layout");
    revalidatePath(`/projects/${parsed.projectId}/sources`);

    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to connect repository" },
      { status: 400 },
    );
  }
}
