import type { ClipTag, Prisma, VideoJobMode, VideoJobStatus } from "@prisma/client";

import {
  briefGenerateSchema,
  briefUpdateSchema,
  calculateCompletenessScore,
  publishCreateSchema,
  sourceCreateSchema,
  studioActionSchema,
  templateRecommendSchema,
  videoGenerateSchema,
} from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";
import { fetchGitHubSource } from "@/lib/github";
import { getDemoWorkspace } from "@/lib/mock-data";
import {
  buildPixversePrompt,
  generateBriefWithOpenAi,
  recommendTemplatesWithOpenAi,
  summarizeSourceWithOpenAi,
} from "@/lib/openai";
import {
  pollPixverseVideo,
  submitTextToVideo,
  submitVideoEdit,
} from "@/lib/pixverse";
import { templateCatalog } from "@/lib/templates";
import { fetchWebsiteSource } from "@/lib/website";

async function getProjectBrief(projectId: string) {
  const brief = await prisma.brief.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  if (!brief) {
    throw new Error("Generate a brief before creating videos");
  }

  return brief;
}

export async function createSourceRecord(input: unknown) {
  const parsed = sourceCreateSchema.parse(input);

  const readContent = async () => {
    if (parsed.type === "TEXT" || parsed.type === "FILE") {
      return parsed.content || parsed.rawLocation;
    }

    if (parsed.type === "GITHUB") {
      const repo = await fetchGitHubSource(parsed.rawLocation);
      return `${repo.name}\n${repo.description ?? ""}\n${repo.readme}`;
    }

    const website = await fetchWebsiteSource(parsed.rawLocation);
    return `${website.text}\n\nIMAGES:\n${website.images.join(", ")}`;
  };

  const content = await readContent();
  const summary = await summarizeSourceWithOpenAi({
    type: parsed.type,
    rawLocation: parsed.rawLocation,
    content,
  });

  if (flags.isDemoMode) {
    return {
      id: `source_${Date.now()}`,
      projectId: parsed.projectId,
      type: parsed.type,
      rawLocation: parsed.rawLocation,
      indexedData: summary,
      status: "INDEXED",
      createdAt: new Date().toISOString(),
    };
  }

  return prisma.source.create({
    data: {
      projectId: parsed.projectId,
      type: parsed.type,
      rawLocation: parsed.rawLocation,
      indexedData: summary as unknown as Prisma.InputJsonValue,
      status: "INDEXED",
    },
  });
}

export async function generateBriefRecord(input: unknown) {
  const parsed = briefGenerateSchema.parse(input);

  if (flags.isDemoMode) {
    return getDemoWorkspace(parsed.projectId).brief;
  }

  const sources = await prisma.source.findMany({
    where: { projectId: parsed.projectId, status: "INDEXED" },
    orderBy: { createdAt: "asc" },
  });

  const summaries = sources.map((source) => source.indexedData).filter(Boolean);
  if (!summaries.length) {
    throw new Error("Add and index at least one source before generating the brief");
  }

  const briefData = await generateBriefWithOpenAi({
    summaries,
    manualDescription: parsed.manualDescription,
  });

  const brief = await prisma.brief.create({
    data: {
      projectId: parsed.projectId,
      data: briefData as unknown as Prisma.InputJsonValue,
      completenessScore: calculateCompletenessScore(briefData),
    },
  });

  return {
    id: brief.id,
    data: brief.data,
    completenessScore: brief.completenessScore,
    createdAt: brief.createdAt.toISOString(),
    updatedAt: brief.updatedAt.toISOString(),
  };
}

export async function updateBriefRecord(id: string, input: unknown) {
  const parsed = briefUpdateSchema.parse(input);
  const completenessScore = calculateCompletenessScore(parsed as never);

  if (flags.isDemoMode) {
    return {
      id,
      data: parsed,
      completenessScore,
      updatedAt: new Date().toISOString(),
    };
  }

  const brief = await prisma.brief.update({
    where: { id },
    data: {
      data: parsed as unknown as Prisma.InputJsonValue,
      completenessScore,
    },
  });

  return {
    id: brief.id,
    data: brief.data,
    completenessScore: brief.completenessScore,
    updatedAt: brief.updatedAt.toISOString(),
  };
}

export async function recommendTemplates(input: unknown) {
  const parsed = templateRecommendSchema.parse(input);
  const brief = flags.isDemoMode
    ? getDemoWorkspace(parsed.projectId).brief
    : await getProjectBrief(parsed.projectId);

  const recommendations = await recommendTemplatesWithOpenAi({
    brief: brief.data as never,
    channelHints: parsed.channelHints,
  });

  return recommendations.map((recommendation) => ({
    ...recommendation,
    template:
      templateCatalog.find(
        (template) => template.key === recommendation.templateKey,
      ) ?? null,
  }));
}

async function maybeCreateClip(
  projectId: string,
  jobId: string,
  outputUrl: string | null,
  thumbnailUrl: string | null,
) {
  if (!outputUrl) {
    return null;
  }

  return prisma.clip.create({
    data: {
      projectId,
      videoJobId: jobId,
      label: "Generated launch clip",
      tag: "HERO",
      durationSeconds: 12,
      version: 1,
      outputUrl,
      thumbnailUrl,
    },
  });
}

export async function generateVideoJob(input: unknown) {
  const parsed = videoGenerateSchema.parse(input);
  const template = templateCatalog.find((item) => item.key === parsed.templateKey);

  if (!template) {
    throw new Error("Invalid template key");
  }

  const brief = flags.isDemoMode
    ? getDemoWorkspace(parsed.projectId).brief
    : await getProjectBrief(parsed.projectId);

  const prompt = await buildPixversePrompt({
    brief: brief.data as never,
    templateName: template.name,
    templateStyle: template.style,
    overrides: parsed.overrides,
  });

  const pixverse = await submitTextToVideo({ prompt, settings: parsed.settings });

  if (flags.isDemoMode) {
    return {
      job: {
        id: `job_${Date.now()}`,
        projectId: parsed.projectId,
        mode: "TEXT2VIDEO",
        prompt,
        settings: parsed.settings,
        pixverseVideoId: pixverse.id,
        status: pixverse.status,
        outputUrl: pixverse.outputUrl,
        thumbnailUrl: pixverse.thumbnailUrl,
      },
      clip: pixverse.outputUrl
        ? {
            id: `clip_${Date.now()}`,
            label: "Generated launch clip",
            tag: "HERO",
            durationSeconds: parsed.settings.durationSeconds,
            version: 1,
            outputUrl: pixverse.outputUrl,
            thumbnailUrl: pixverse.thumbnailUrl,
          }
        : null,
    };
  }

  const status = (pixverse.status as VideoJobStatus) ?? "QUEUED";
  const job = await prisma.videoJob.create({
    data: {
      projectId: parsed.projectId,
      mode: "TEXT2VIDEO",
      prompt,
      settings: parsed.settings as unknown as Prisma.InputJsonValue,
      pixverseVideoId: pixverse.id,
      status,
      outputUrl: pixverse.outputUrl,
      thumbnailUrl: pixverse.thumbnailUrl,
      creditsUsed: pixverse.creditsUsed,
    },
  });

  const clip =
    status === "READY"
      ? await maybeCreateClip(
          parsed.projectId,
          job.id,
          pixverse.outputUrl,
          pixverse.thumbnailUrl,
        )
      : null;

  return { job, clip };
}

export async function pollVideoJobs(projectId?: string) {
  if (flags.isDemoMode) {
    return getDemoWorkspace(projectId).jobs;
  }

  const jobs = await prisma.videoJob.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      status: { in: ["QUEUED", "PROCESSING"] },
      pixverseVideoId: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  const results = [];
  for (const job of jobs) {
    const result = await pollPixverseVideo(job.pixverseVideoId!);
    const updated = await prisma.videoJob.update({
      where: { id: job.id },
      data: {
        status: result.status as VideoJobStatus,
        outputUrl: result.outputUrl,
        thumbnailUrl: result.thumbnailUrl,
        creditsUsed: result.creditsUsed,
      },
    });

    if (result.status === "READY" && result.outputUrl) {
      const existingClip = await prisma.clip.findFirst({
        where: { videoJobId: updated.id },
      });
      if (!existingClip) {
        await maybeCreateClip(
          updated.projectId,
          updated.id,
          result.outputUrl,
          result.thumbnailUrl,
        );
      }
    }

    results.push(updated);
  }

  return results;
}

export async function createStudioJob(
  mode: "MODIFY" | "EXTEND" | "TRANSITION",
  input: unknown,
) {
  const parsed = studioActionSchema.parse(input);

  if (flags.isDemoMode) {
    return {
      job: {
        id: `job_${Date.now()}`,
        mode,
        status: "READY",
        prompt: parsed.instructions,
      },
      clip: {
        id: `clip_${Date.now()}`,
        label: `${mode} version`,
        tag: "FULL",
        durationSeconds: 14,
        version: 2,
        outputUrl: `https://storage.example.com/launchly/${mode.toLowerCase()}-${Date.now()}.mp4`,
      },
    };
  }

  const clip = await prisma.clip.findUnique({ where: { id: parsed.clipId } });
  if (!clip) {
    throw new Error("Clip not found");
  }

  const result = await submitVideoEdit({
    mode,
    prompt: parsed.instructions,
    sourceUrl: clip.outputUrl,
  });

  const job = await prisma.videoJob.create({
    data: {
      projectId: clip.projectId,
      mode: mode as VideoJobMode,
      prompt: parsed.instructions,
      pixverseVideoId: result.id,
      status: result.status as VideoJobStatus,
      outputUrl: result.outputUrl,
      thumbnailUrl: result.thumbnailUrl,
    },
  });

  const nextVersion = clip.version + 1;
  const newClip = result.outputUrl
    ? await prisma.clip.create({
        data: {
          projectId: clip.projectId,
          videoJobId: job.id,
          parentClipId: clip.id,
          label: `${clip.label} v${nextVersion}`,
          tag: clip.tag as ClipTag,
          durationSeconds: clip.durationSeconds,
          version: nextVersion,
          outputUrl: result.outputUrl,
          thumbnailUrl: result.thumbnailUrl,
        },
      })
    : null;

  return { job, clip: newClip };
}

export async function createPublishPackage(input: unknown) {
  const parsed = publishCreateSchema.parse(input);

  if (flags.isDemoMode) {
    return {
      id: `package_${Date.now()}`,
      shareToken: `share-${Date.now()}`,
      status: "DRAFT",
      publicTitle: parsed.publicTitle ?? "Launchly Share Package",
      publicDescription: parsed.publicDescription ?? "Generated preview package",
    };
  }

  const shareToken = crypto.randomUUID().replace(/-/g, "");
  return prisma.publishPackage.create({
    data: {
      projectId: parsed.projectId,
      shareToken,
      publicTitle: parsed.publicTitle,
      publicDescription: parsed.publicDescription,
      clips: {
        create: parsed.clipIds.map((clipId, index) => ({
          clipId,
          sortOrder: index,
        })),
      },
    },
  });
}

export async function getPublicPackage(shareToken: string) {
  if (flags.isDemoMode) {
    const workspace = getDemoWorkspace();
    return {
      package: workspace.publishPackage,
      clips: workspace.clips,
      brief: workspace.brief,
      project: workspace.project,
    };
  }

  const pkg = await prisma.publishPackage.findUnique({
    where: { shareToken },
    include: {
      project: {
        include: { briefs: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
      clips: { include: { clip: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!pkg) {
    throw new Error("Publish package not found");
  }

  return {
    package: pkg,
    clips: pkg.clips.map((item) => item.clip),
    brief: pkg.project.briefs[0] ?? null,
    project: pkg.project,
  };
}
