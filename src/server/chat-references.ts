import { flags } from "@/lib/env";
import type { ChatReferenceOption } from "@/lib/chat-references";
import { getDemoProjects, getDemoWorkspace } from "@/lib/mock-data";
import { getProjectWorkspace, listProjectsForViewer } from "@/server/projects";

export async function listChatReferenceOptions(viewerId: string, projectId: string) {
  if (flags.isDemoMode) {
    const projects = getDemoProjects();
    const workspace = getDemoWorkspace(projectId);
    const options: ChatReferenceOption[] = [];

    for (const project of projects) {
      options.push({
        kind: "workspace",
        id: project.id,
        label: project.name,
        description: "Workspace",
      });
    }

    for (const source of workspace.sources) {
      options.push({
        kind: "source",
        id: source.id,
        label: source.title ?? source.rawLocation,
        description: source.type,
      });
    }

    for (const clip of workspace.clips) {
      options.push({
        kind: "clip",
        id: clip.id,
        label: clip.label ?? `Video ${clip.id.slice(0, 6)}`,
        description: "Video clip",
      });
    }

    for (const image of workspace.images) {
      options.push({
        kind: "image",
        id: image.id,
        label: image.label ?? `Image ${image.id.slice(0, 6)}`,
        description: image.kind,
      });
    }

    return options;
  }

  const [projects, workspace] = await Promise.all([
    listProjectsForViewer(viewerId),
    getProjectWorkspace(projectId, viewerId),
  ]);

  const options: ChatReferenceOption[] = projects.map((project) => ({
    kind: "workspace" as const,
    id: project.id,
    label: project.name,
    description: project.id === projectId ? "Current workspace" : "Workspace",
  }));

  for (const source of workspace.sources) {
    options.push({
      kind: "source",
      id: source.id,
      label: source.title ?? source.rawLocation,
      description: source.type,
    });
  }

  for (const clip of workspace.clips) {
    options.push({
      kind: "clip",
      id: clip.id,
      label: clip.label ?? `Video ${clip.id.slice(0, 6)}`,
      description: clip.tag,
    });
  }

  for (const image of workspace.images) {
    options.push({
      kind: "image",
      id: image.id,
      label: image.label ?? `Image ${image.id.slice(0, 6)}`,
      description: image.kind,
    });
  }

  return options;
}

export function buildFocusedReferenceContext(
  workspace: Awaited<ReturnType<typeof getProjectWorkspace>>,
  references: ChatReferenceOption[],
) {
  if (!references.length) {
    return null;
  }

  const focused: Record<string, unknown> = { references: references.map((r) => ({ kind: r.kind, id: r.id, label: r.label })) };

  const workspaces = references.filter((r) => r.kind === "workspace");
  if (workspaces.length) {
    focused.workspaces = workspaces.map((r) => ({
      id: r.id,
      label: r.label,
      isCurrent: r.id === workspace.project.id,
    }));
  }

  const sourceIds = new Set(references.filter((r) => r.kind === "source").map((r) => r.id));
  if (sourceIds.size) {
    focused.sources = workspace.sources.filter((s) => sourceIds.has(s.id));
  }

  const clipIds = new Set(references.filter((r) => r.kind === "clip").map((r) => r.id));
  if (clipIds.size) {
    focused.clips = workspace.clips.filter((c) => clipIds.has(c.id));
  }

  const imageIds = new Set(references.filter((r) => r.kind === "image").map((r) => r.id));
  if (imageIds.size) {
    focused.images = workspace.images.filter((i) => imageIds.has(i.id));
  }

  return focused;
}
