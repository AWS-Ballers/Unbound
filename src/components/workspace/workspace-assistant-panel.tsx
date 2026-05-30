"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ChatPanel } from "@/components/workspace/chat-panel";

export type WorkspaceAssistantMode = "sources" | "images" | "video";

const quickPrompts: Record<WorkspaceAssistantMode, string[]> = {
  sources: [
    "Find missing sources",
    "Suggest templates",
    "What should I add from GitHub?",
    "Summarize this workspace",
  ],
  images: [
    "Generate a hero image for this workspace",
    "Generate a product detail image",
    "Describe the best image direction",
    "What stills should we create before video?",
  ],
  video: [
    "Generate a launch video for this workspace",
    "Write a video prompt from the brief",
    "Suggest a template for this product",
    "What motion fits this workspace?",
  ],
};

export function WorkspaceAssistantPanel({
  projectId,
  mode,
  initialThreadId,
  initialMessages,
}: {
  projectId: string;
  mode: WorkspaceAssistantMode;
  initialThreadId?: string;
  initialMessages: Array<{ id: string; role: string; content: string; citations?: unknown }>;
}) {
  const router = useRouter();

  const titles: Record<WorkspaceAssistantMode, { title: string; detail: string }> = {
    sources: {
      title: "Source assistant",
      detail: "Ask what to add to this workspace. Type / to reference a file or source.",
    },
    images: {
      title: "Image assistant",
      detail: "Ask to generate images for this workspace. Try “Generate a hero image for this workspace”.",
    },
    video: {
      title: "Video assistant",
      detail: "Ask to generate a launch video for this workspace, or refine the prompt before rendering.",
    },
  };

  return (
    <ChatPanel
      projectId={projectId}
      initialThreadId={initialThreadId}
      initialMessages={initialMessages}
      header={titles[mode]}
      quickPrompts={quickPrompts[mode]}
      onAssistantReply={(payload) => {
        if (payload.generation) {
          if (payload.generation.kind === "image") {
            toast.success("Image generation started for this workspace");
          } else {
            toast.success("Video generation queued for this workspace");
          }
          router.refresh();
        }
      }}
    />
  );
}
