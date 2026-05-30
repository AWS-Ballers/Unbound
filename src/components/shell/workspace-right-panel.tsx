"use client";

import { usePathname } from "next/navigation";
import { FolderOpenDot, LibraryBig, Sparkles } from "lucide-react";

import type { z } from "zod";

import { generationDefaultsSchema } from "@/lib/contracts";
import { GenerateSidePanel } from "@/components/workspace/generate-side-panel";
import { WorkspaceAssistantPanel } from "@/components/workspace/workspace-assistant-panel";

type GenerationDefaults = z.infer<typeof generationDefaultsSchema>;

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  citations?: unknown;
};

export function WorkspaceRightPanel({
  projectId,
  initialThreadId,
  initialMessages,
  activeTemplateKey,
  defaultTemplateKey,
  generationDefaults,
}: {
  projectId: string;
  initialThreadId?: string;
  initialMessages: ChatMessage[];
  activeTemplateKey?: string | null;
  defaultTemplateKey: string;
  generationDefaults: GenerationDefaults;
}) {
  const pathname = usePathname();

  if (pathname.endsWith("/sources")) {
    return (
      <WorkspaceAssistantPanel
        projectId={projectId}
        mode="sources"
        initialThreadId={initialThreadId}
        initialMessages={initialMessages}
      />
    );
  }

  if (pathname.endsWith("/images")) {
    return (
      <WorkspaceAssistantPanel
        projectId={projectId}
        mode="images"
        initialThreadId={initialThreadId}
        initialMessages={initialMessages}
      />
    );
  }

  if (pathname.endsWith("/generate")) {
    return (
      <GenerateSidePanel
        projectId={projectId}
        initialThreadId={initialThreadId}
        initialMessages={initialMessages}
        activeTemplateKey={activeTemplateKey}
        defaultTemplateKey={defaultTemplateKey}
        generationDefaults={generationDefaults}
      />
    );
  }

  if (pathname.endsWith("/studio")) {
    return (
      <WorkspaceAssistantPanel
        projectId={projectId}
        mode="video"
        initialThreadId={initialThreadId}
        initialMessages={initialMessages}
      />
    );
  }

  const guides = [
    {
      match: "/library",
      icon: LibraryBig,
      title: "Library",
      detail: "Every generated image and edited video for this workspace lands here.",
    },
  ];

  const guide =
    guides.find((item) => pathname.endsWith(item.match)) ??
    ({
      icon: FolderOpenDot,
      title: "Workspace",
      detail: "Use the sidebar to move between sources, images, video, edit, and library.",
    } as const);

  const Icon = guide.icon;

  return (
    <div className="right-panel">
      <div className="right-panel-body">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{guide.title}</p>
            <p className="text-xs text-[var(--muted)]">This workspace</p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-6 text-[var(--muted)]">{guide.detail}</p>
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Assistant
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            Open Workspace, Images, or Video to chat and generate assets scoped to this project.
          </p>
        </div>
      </div>
    </div>
  );
}
