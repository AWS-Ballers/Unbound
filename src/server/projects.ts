import type { ProjectCategory, Prisma } from "@prisma/client";
import { cache } from "react";

import { generationDefaultsSchema, projectCreateSchema, projectUpdateSchema } from "@/lib/contracts";
import { isDatabaseUnreachableError, logDatabaseFallback } from "@/lib/database";
import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";
import { getDemoProjects, getDemoWorkspace } from "@/lib/mock-data";
import { templateCatalog } from "@/lib/templates";

export const listProjectsForViewer = cache(async function listProjectsForViewer(viewerId: string) {
  if (flags.isDemoMode) {
    return getDemoProjects();
  }

  let projects;
  try {
    projects = await prisma.project.findMany({
      where: { org: { ownerId: viewerId } },
      include: {
        sources: true,
        clips: true,
        briefs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development" && isDatabaseUnreachableError(error)) {
      logDatabaseFallback("listProjectsForViewer");
      return getDemoProjects();
    }
    throw error;
  }

  return projects.map((project) => ({
    id: project.id,
    orgId: project.orgId,
    name: project.name,
    description: project.description,
    category: project.category,
    activeTemplateKey: project.activeTemplateKey,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    metrics: {
      sources: project.sources.length,
      clips: project.clips.length,
      completeness: project.briefs[0]?.completenessScore ?? 0,
    },
  }));
});

async function ensureOrganization(viewerId: string) {
  const existing = await prisma.organization.findFirst({
    where: { ownerId: viewerId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.organization.create({
    data: {
      ownerId: viewerId,
      name: "My Launchly Org",
    },
  });
}

function buildRecommendations(activeTemplateKey?: string | null) {
  const ordered = [...templateCatalog].sort((a, b) => {
    if (a.key === activeTemplateKey) return -1;
    if (b.key === activeTemplateKey) return 1;
    return 0;
  });

  return ordered.slice(0, 3).map((template, index) => ({
    templateKey: template.key,
    confidence: [0.95, 0.87, 0.79][index] ?? 0.72,
    reasoning:
      index === 0
        ? "Best fit for the current workspace direction and strongest starting point for generation."
        : index === 1
          ? "A strong alternative if you want a more product-led visual flow."
          : "Useful when the team wants a clearer explanatory story before polishing the final cut.",
    template,
  }));
}

export async function createProjectForViewer(viewerId: string, input: unknown) {
  const parsed = projectCreateSchema.parse(input);

  if (flags.isDemoMode) {
    return {
      id: `project_${Date.now()}`,
      orgId: "launchly-demo-org",
      name: parsed.name,
      description: parsed.description || null,
      category: parsed.category,
      activeTemplateKey: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: { sources: 0, clips: 0, completeness: 0 },
    };
  }

  const organization = await ensureOrganization(viewerId);

  const project = await prisma.project.create({
    data: {
      orgId: organization.id,
      name: parsed.name,
      description: parsed.description || null,
      category: parsed.category as ProjectCategory,
      generationDefaults: generationDefaultsSchema.parse({}) as unknown as Prisma.InputJsonValue,
      chatThreads: {
        create: {
          title: `${parsed.name} workspace chat`,
          messages: {
            create: {
              role: "SYSTEM",
              content:
                "Welcome to your workspace. Add sources, choose a template, and use the assistant to shape image and video generation.",
            },
          },
        },
      },
    },
  });

  return {
    id: project.id,
    orgId: project.orgId,
    name: project.name,
    description: project.description,
    category: project.category,
    activeTemplateKey: project.activeTemplateKey,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    metrics: { sources: 0, clips: 0, completeness: 0 },
  };
}

export async function updateProjectForViewer(
  viewerId: string,
  projectId: string,
  input: unknown,
) {
  const parsed = projectUpdateSchema.parse(input);

  if (flags.isDemoMode) {
    const workspace = getDemoWorkspace(projectId);
    return {
      ...workspace.project,
      activeTemplateKey: parsed.activeTemplateKey ?? workspace.project.activeTemplateKey,
      templateSettings: parsed.templateSettings ?? { templateKey: parsed.activeTemplateKey ?? workspace.project.activeTemplateKey },
      generationDefaults:
        parsed.generationDefaults ?? { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" },
    };
  }

  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      org: { ownerId: viewerId },
    },
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  const project = await prisma.project.update({
    where: { id: existingProject.id },
    data: {
      ...(parsed.activeTemplateKey ? { activeTemplateKey: parsed.activeTemplateKey } : {}),
      ...(parsed.templateSettings
        ? { templateSettings: parsed.templateSettings as unknown as Prisma.InputJsonValue }
        : {}),
      ...(parsed.generationDefaults
        ? { generationDefaults: parsed.generationDefaults as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });

  return project;
}

export const getProjectWorkspace = cache(async function getProjectWorkspace(
  projectId: string,
  viewerId?: string,
) {
  if (flags.isDemoMode) {
    return getDemoWorkspace(projectId);
  }

  let project;
  try {
    project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...(viewerId ? { org: { ownerId: viewerId } } : {}),
      },
      include: {
        sources: { orderBy: { createdAt: "desc" } },
        briefs: { orderBy: { createdAt: "desc" }, take: 1 },
        videoJobs: { orderBy: { createdAt: "desc" } },
        clips: { orderBy: { createdAt: "desc" } },
        imageJobs: { orderBy: { createdAt: "desc" } },
        imageAssets: { orderBy: { createdAt: "desc" } },
        chatThreads: {
          orderBy: { updatedAt: "desc" },
          include: {
            messages: { orderBy: { createdAt: "asc" }, take: 20 },
          },
          take: 1,
        },
        publishPackages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development" && isDatabaseUnreachableError(error)) {
      logDatabaseFallback("getProjectWorkspace");
      return getDemoWorkspace(projectId);
    }
    throw error;
  }

  if (!project) {
    throw new Error("Project not found");
  }

  return {
    viewer: viewerId
      ? {
          id: viewerId,
        }
      : null,
    project: {
      id: project.id,
      orgId: project.orgId,
      name: project.name,
      description: project.description,
      category: project.category,
      activeTemplateKey: project.activeTemplateKey,
      templateSettings: project.templateSettings,
      generationDefaults: project.generationDefaults,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
    sources: project.sources.map((source) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      rawLocation: source.rawLocation,
      metadata: source.metadata,
      status: source.status,
      indexedData: source.indexedData,
      errorMessage: source.errorMessage,
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString(),
    })),
    brief: project.briefs[0]
      ? {
          id: project.briefs[0].id,
          data: project.briefs[0].data,
          completenessScore: project.briefs[0].completenessScore,
          createdAt: project.briefs[0].createdAt.toISOString(),
          updatedAt: project.briefs[0].updatedAt.toISOString(),
        }
      : null,
    recommendations: buildRecommendations(project.activeTemplateKey),
    jobs: project.videoJobs.map((job) => ({
      id: job.id,
      mode: job.mode,
      prompt: job.prompt,
      status: job.status,
      settings: job.settings,
      outputUrl: job.outputUrl,
      thumbnailUrl: job.thumbnailUrl,
      createdAt: job.createdAt.toISOString(),
    })),
    imageJobs: project.imageJobs.map((job) => ({
      id: job.id,
      prompt: job.prompt,
      settings: job.settings,
      status: job.status,
      outputUrl: job.outputUrl,
      thumbnailUrl: job.thumbnailUrl,
      createdAt: job.createdAt.toISOString(),
    })),
    images: project.imageAssets.map((image) => ({
      id: image.id,
      imageJobId: image.imageJobId,
      label: image.label,
      kind: image.kind,
      prompt: image.prompt,
      outputUrl: image.outputUrl,
      thumbnailUrl: image.thumbnailUrl,
      metadata: image.metadata,
      createdAt: image.createdAt.toISOString(),
    })),
    clips: project.clips.map((clip) => ({
      id: clip.id,
      videoJobId: clip.videoJobId,
      label: clip.label,
      tag: clip.tag,
      durationSeconds: clip.durationSeconds,
      version: clip.version,
      outputUrl: clip.outputUrl,
      thumbnailUrl: clip.thumbnailUrl,
      createdAt: clip.createdAt.toISOString(),
    })),
    chatThread: project.chatThreads[0]
      ? {
          id: project.chatThreads[0].id,
          title: project.chatThreads[0].title,
          messages: project.chatThreads[0].messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            citations: message.citations,
            createdAt: message.createdAt.toISOString(),
          })),
        }
      : null,
    publishPackage: project.publishPackages[0]
      ? {
          id: project.publishPackages[0].id,
          shareToken: project.publishPackages[0].shareToken,
          status: project.publishPackages[0].status,
          publicTitle: project.publishPackages[0].publicTitle,
          publicDescription: project.publishPackages[0].publicDescription,
          createdAt: project.publishPackages[0].createdAt.toISOString(),
        }
      : null,
  };
});
