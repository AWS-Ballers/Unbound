"use client";

import type { z } from "zod";

import { generationDefaultsSchema } from "@/lib/contracts";
import { VideoRightPanel } from "@/components/workspace/video-right-panel";
import { WorkspaceAssistantPanel } from "@/components/workspace/workspace-assistant-panel";

type GenerationDefaults = z.infer<typeof generationDefaultsSchema>;

export function GenerateSidePanel({
  projectId,
  initialThreadId,
  initialMessages,
  activeTemplateKey,
  defaultTemplateKey,
  generationDefaults,
}: {
  projectId: string;
  initialThreadId?: string;
  initialMessages: Array<{ id: string; role: string; content: string; citations?: unknown }>;
  activeTemplateKey?: string | null;
  defaultTemplateKey: string;
  generationDefaults: GenerationDefaults;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden border-b border-[var(--border)]">
        <WorkspaceAssistantPanel
          projectId={projectId}
          mode="video"
          initialThreadId={initialThreadId}
          initialMessages={initialMessages}
        />
      </div>
      <div className="shrink-0">
        <VideoRightPanel
          projectId={projectId}
          activeTemplateKey={activeTemplateKey}
          defaultTemplateKey={defaultTemplateKey}
          generationDefaults={generationDefaults}
        />
      </div>
    </div>
  );
}
