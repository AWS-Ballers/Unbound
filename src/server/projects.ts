import type { ProjectCategory } from "@prisma/client";

import { projectCreateSchema } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";
import { getDemoProjects, getDemoWorkspace } from "@/lib/mock-data";

export async function listProjectsForViewer(viewerId: string) {
  if (flags.isDemoMode) {
    return getDemoProjects();
  }

  const projects = await prisma.project.findMany({
    where: { org: { ownerId: viewerId } },
    include: {
      sources: true,
      clips: true,
      briefs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

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
}

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

export async function getProjectWorkspace(projectId: string, viewerId?: string) {
  if (flags.isDemoMode) {
    return getDemoWorkspace(projectId);
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(viewerId ? { org: { ownerId: viewerId } } : {}),
    },
    include: {
      sources: { orderBy: { createdAt: "desc" } },
      briefs: { orderBy: { createdAt: "desc" }, take: 1 },
      videoJobs: { orderBy: { createdAt: "desc" } },
      clips: { orderBy: { createdAt: "desc" } },
      publishPackages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return {
    viewer: null,
    project: {
      id: project.id,
      orgId: project.orgId,
      name: project.name,
      description: project.description,
      category: project.category,
      activeTemplateKey: project.activeTemplateKey,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
    sources: project.sources.map((source) => ({
      id: source.id,
      type: source.type,
      rawLocation: source.rawLocation,
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
    recommendations: [],
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
}
