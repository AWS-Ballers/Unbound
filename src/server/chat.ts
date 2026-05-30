import { Prisma } from "@prisma/client";

import { extractReferencesFromMessage } from "@/lib/chat-references";
import { chatRequestSchema } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";
import { getDemoWorkspace } from "@/lib/mock-data";
import { answerWorkspaceQuestion } from "@/lib/openai";
import { templateCatalog } from "@/lib/templates";
import { tryWorkspaceGenerationFromChat } from "@/server/chat-generation";
import { buildFocusedReferenceContext, listChatReferenceOptions } from "@/server/chat-references";
import { getProjectWorkspace } from "@/server/projects";

export async function createWorkspaceChatMessage(input: unknown, viewerId?: string) {
  const parsed = chatRequestSchema.parse(input);
  const { activeReferences } = extractReferencesFromMessage(
    parsed.message,
    parsed.references ?? [],
  );

  if (flags.isDemoMode) {
    const workspace = getDemoWorkspace(parsed.projectId);
    const allOptions = viewerId
      ? await listChatReferenceOptions(viewerId, parsed.projectId)
      : [];
    const resolvedReferences = activeReferences.length
      ? allOptions.filter((option) =>
          activeReferences.some((ref) => ref.kind === option.kind && ref.id === option.id),
        )
      : [];
    const focusedContext = buildFocusedReferenceContext(workspace, resolvedReferences);

    let generation: Awaited<ReturnType<typeof tryWorkspaceGenerationFromChat>> = null;
    try {
      generation = await tryWorkspaceGenerationFromChat(parsed.projectId, parsed.message, {
        projectName: workspace.project.name,
        templateKey: workspace.project.activeTemplateKey,
        defaultTemplateKey: templateCatalog[0]?.key ?? "launch-cinematic",
      });
    } catch (error) {
      const generationError =
        error instanceof Error ? error.message : "Generation failed for this workspace.";
      return {
        thread: {
          id: workspace.chatThread?.id ?? "demo-thread",
          title: workspace.chatThread?.title ?? `${workspace.project.name} workspace chat`,
        },
        userMessage: {
          id: `user_${Date.now()}`,
          role: "USER",
          content: parsed.message,
        },
        assistantMessage: {
          id: `assistant_${Date.now()}`,
          role: "ASSISTANT",
          content: generationError,
          citations: [],
          suggestions: ["Check PixVerse CLI is installed and authenticated"],
        },
        generation: null,
      };
    }

    const reply = await answerWorkspaceQuestion({
      projectName: workspace.project.name,
      workspaceContext: workspace,
      focusedContext,
      question: parsed.message,
    });

    const generationNote = generation
      ? generation.kind === "image"
        ? `\n\nI started image generation for this workspace (${generation.label}). Open the Images tab or Library to review it.`
        : `\n\nI queued video generation for this workspace (status: ${generation.status}). Check the Video tab and Library when it finishes.`
      : "";

    return {
      thread: {
        id: workspace.chatThread?.id ?? "demo-thread",
        title: workspace.chatThread?.title ?? `${workspace.project.name} workspace chat`,
      },
      userMessage: {
        id: `user_${Date.now()}`,
        role: "USER",
        content: parsed.message,
      },
      assistantMessage: {
        id: `assistant_${Date.now()}`,
        role: "ASSISTANT",
        content: `${reply.answer}${generationNote}`,
        citations: reply.citations,
        suggestions: reply.suggestions,
      },
      generation,
    };
  }

  let thread =
    parsed.threadId
      ? await prisma.chatThread.findUnique({ where: { id: parsed.threadId } })
      : await prisma.chatThread.findFirst({
          where: { projectId: parsed.projectId },
          orderBy: { updatedAt: "desc" },
        });

  if (!thread) {
    thread = await prisma.chatThread.create({
      data: {
        projectId: parsed.projectId,
        title: "Workspace chat",
      },
    });
  }

  const workspace = await getProjectWorkspace(parsed.projectId, viewerId);
  const allOptions = viewerId
    ? await listChatReferenceOptions(viewerId, parsed.projectId)
    : [];
  const resolvedReferences = activeReferences.length
    ? allOptions.filter((option) =>
        activeReferences.some((ref) => ref.kind === option.kind && ref.id === option.id),
      )
    : [];
  const focusedContext = buildFocusedReferenceContext(workspace, resolvedReferences);

  let generation: Awaited<ReturnType<typeof tryWorkspaceGenerationFromChat>> = null;
  try {
    generation = await tryWorkspaceGenerationFromChat(parsed.projectId, parsed.message, {
      projectName: workspace.project.name,
      templateKey: workspace.project.activeTemplateKey,
      defaultTemplateKey: templateCatalog[0]?.key ?? "launch-cinematic",
    });
  } catch (error) {
    const generationError =
      error instanceof Error ? error.message : "Generation failed for this workspace.";
    const userMessage = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        role: "USER",
        content: parsed.message,
      },
    });
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        role: "ASSISTANT",
        content: generationError,
        citations: {
          items: [],
          suggestions: ["Run pixverse auth login", "Set PIXVERSE_CLI_PATH on Windows"],
        } as unknown as Prisma.InputJsonValue,
      },
    });
    return {
      thread: { id: thread.id, title: thread.title },
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        suggestions: ["Run pixverse auth login", "Set PIXVERSE_CLI_PATH on Windows"],
      },
      generation: null,
    };
  }

  const reply = await answerWorkspaceQuestion({
    projectName: workspace.project.name,
    workspaceContext: {
      project: workspace.project,
      sources: workspace.sources,
      brief: workspace.brief,
      clips: workspace.clips,
      images: workspace.images,
      recommendations: workspace.recommendations,
    },
    focusedContext,
    question: parsed.message,
  });

  const generationNote = generation
    ? generation.kind === "image"
      ? `\n\nI started image generation for this workspace (${generation.label}). Open the Images tab or Library to review it.`
      : `\n\nI queued video generation for this workspace (status: ${generation.status}). Check the Video tab and Library when it finishes.`
    : "";

  const userMessage = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      role: "USER",
      content: parsed.message,
    },
  });

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      role: "ASSISTANT",
      content: `${reply.answer}${generationNote}`,
      citations: {
        items: reply.citations,
        suggestions: reply.suggestions,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    thread: {
      id: thread.id,
      title: thread.title,
    },
    userMessage,
    assistantMessage: {
      ...assistantMessage,
      suggestions: reply.suggestions,
    },
    generation,
  };
}
