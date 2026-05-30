import type { ClipTag, Prisma, VideoJobMode, VideoJobStatus } from "@prisma/client";

import {
  briefDataSchema,
  briefGenerateSchema,
  briefUpdateSchema,
  calculateCompletenessScore,
  imageGenerateSchema,
  publishCreateSchema,
  sourceCreateSchema,
  studioActionSchema,
  templateRecommendSchema,
  videoGenerateSchema,
  type BriefData,
} from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";
import {
  buildGitHubSourceContent,
  buildGitHubSourceMetadata,
  inspectGitHubRepository,
} from "@/lib/github";
import { getGitHubAccessTokenForViewer } from "@/server/github";
import { getDemoWorkspace } from "@/lib/mock-data";
import {
  buildImagePrompt,
  buildPixversePromptSync,
  generateBriefWithOpenAi,
  recommendTemplatesWithOpenAi,
  summarizeSourceWithOpenAi,
} from "@/lib/openai";
import {
  generateImageWithPixverse,
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

function buildFallbackBriefData(input: {
  productName: string;
  description?: string | null;
  category?: string;
}): BriefData {
  return {
    productName: input.productName,
    tagline: input.description?.slice(0, 120) || `Launch story for ${input.productName}`,
    productCategory: input.category ?? "SAAS",
    keyFeatures: ["Core product value", "Key workflow", "Launch payoff"],
    valueProposition:
      input.description || `A premium launch film introducing ${input.productName} to the market.`,
    targetAudience: "Startup founders, product marketers, and launch teams",
    toneOfVoice: "Confident, cinematic, polished",
    visualStyle: "Premium lighting, clean product framing, modern campaign aesthetic",
    primaryCTA: "Start your launch",
    differentiators: ["Clear positioning", "High-end visual tone", "Memorable launch pacing"],
  };
}

async function getBriefDataForGeneration(projectId: string): Promise<BriefData> {
  if (flags.isDemoMode) {
    const workspace = getDemoWorkspace(projectId);
    if (workspace.brief?.data) {
      return briefDataSchema.parse(workspace.brief.data);
    }

    return buildFallbackBriefData({
      productName: workspace.project.name,
      description: workspace.project.description,
      category: workspace.project.category,
    });
  }

  const brief = await prisma.brief.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  if (brief?.data) {
    return briefDataSchema.parse(brief.data);
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  return buildFallbackBriefData({
    productName: project.name,
    description: project.description,
    category: project.category,
  });
}

export async function createSourceRecord(input: unknown, viewerId?: string) {
  const parsed = sourceCreateSchema.parse(input);

  let githubMetadata: Record<string, unknown> | undefined;

  const readContent = async () => {
    if (parsed.type === "TEXT" || parsed.type === "FILE") {
      return parsed.content || parsed.rawLocation;
    }

    if (parsed.type === "GITHUB") {
      const accessToken = viewerId ? await getGitHubAccessTokenForViewer(viewerId) : null;
      const inspection = await inspectGitHubRepository(parsed.rawLocation, accessToken);
      githubMetadata = buildGitHubSourceMetadata(inspection);
      return buildGitHubSourceContent(inspection);
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

  const metadata = {
    ...(parsed.metadata ?? {}),
    ...(githubMetadata ?? {}),
  };

  if (flags.isDemoMode) {
    return {
      id: `source_${Date.now()}`,
      projectId: parsed.projectId,
      type: parsed.type,
      title: parsed.title ?? parsed.rawLocation,
      rawLocation: parsed.rawLocation,
      metadata: Object.keys(metadata).length ? metadata : null,
      indexedData: summary,
      status: "INDEXED",
      createdAt: new Date().toISOString(),
    };
  }

  if (viewerId) {
    const project = await prisma.project.findFirst({
      where: { id: parsed.projectId, org: { ownerId: viewerId } },
      select: { id: true },
    });

    if (!project) {
      throw new Error("Workspace not found");
    }
  }

  return prisma.source.create({
    data: {
      projectId: parsed.projectId,
      type: parsed.type,
      title: parsed.title ?? parsed.rawLocation,
      rawLocation: parsed.rawLocation,
      metadata: metadata as unknown as Prisma.InputJsonValue,
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
  const briefData = await getBriefDataForGeneration(parsed.projectId);

  const recommendations = await recommendTemplatesWithOpenAi({
    brief: briefData,
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

function legacyImagePlaceholder(prompt: string, size: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

async function resolveGeneratedImage(prompt: string, size: string) {
  if (flags.hasPixverseCli) {
    const result = await generateImageWithPixverse({ prompt, size });
    if (!result.outputUrl) {
      throw new Error("PixVerse CLI did not return an image URL. Check auth with `pixverse auth status`.");
    }
    return {
      outputUrl: result.outputUrl,
      thumbnailUrl: result.thumbnailUrl ?? result.outputUrl,
      status: result.status,
      externalId: result.id,
    };
  }

  return {
    outputUrl: legacyImagePlaceholder(prompt, size),
    thumbnailUrl: legacyImagePlaceholder(prompt, size),
    status: "READY" as const,
    externalId: null,
  };
}

export async function generateVideoJob(input: unknown) {
  const parsed = videoGenerateSchema.parse(input);
  const template = templateCatalog.find((item) => item.key === parsed.templateKey);

  if (!template) {
    throw new Error("Invalid template key");
  }

  const briefData = await getBriefDataForGeneration(parsed.projectId);

  const prompt = buildPixversePromptSync({
    brief: briefData,
    templateName: template.name,
    templateStyle: template.style,
    overrides: [
      parsed.overrides,
      parsed.sourceImageAssetId ? "Use the selected reference image as the visual anchor for the motion treatment." : "",
    ]
      .filter(Boolean)
      .join(" "),
  });

  const pixverse = await submitTextToVideo({ prompt, settings: parsed.settings });

  if (flags.isDemoMode) {
    return {
      job: {
        id: `job_${Date.now()}`,
        projectId: parsed.projectId,
        mode: parsed.sourceImageAssetId ? "IMG2VIDEO" : "TEXT2VIDEO",
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
      mode: parsed.sourceImageAssetId ? "IMG2VIDEO" : "TEXT2VIDEO",
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

export async function generateImageAsset(input: unknown) {
  const parsed = imageGenerateSchema.parse(input);
  const briefData = await getBriefDataForGeneration(parsed.projectId);
  const template = parsed.templateKey
    ? templateCatalog.find((item) => item.key === parsed.templateKey)
    : null;

  const prompt = await buildImagePrompt({
    brief: briefData,
    templateName: template?.name,
    direction: parsed.prompt,
  });
  const generated = await resolveGeneratedImage(prompt, parsed.size);

  if (flags.isDemoMode) {
    return {
      job: {
        id: `image_job_${Date.now()}`,
        prompt,
        status: generated.status,
        outputUrl: generated.outputUrl,
        createdAt: new Date().toISOString(),
      },
      image: {
        id: `image_${Date.now()}`,
        label: template ? `${template.name} concept` : "Generated concept",
        kind: parsed.kind,
        prompt,
        outputUrl: generated.outputUrl,
        thumbnailUrl: generated.thumbnailUrl,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const job = await prisma.imageJob.create({
    data: {
      projectId: parsed.projectId,
      prompt,
      settings: {
        size: parsed.size,
        templateKey: parsed.templateKey,
        pixverseImageId: generated.externalId,
        provider: flags.hasPixverseCli ? "pixverse-cli" : "legacy",
      } as unknown as Prisma.InputJsonValue,
      status: generated.status === "READY" ? "READY" : "PROCESSING",
      outputUrl: generated.outputUrl,
      thumbnailUrl: generated.thumbnailUrl,
    },
  });

  const image = await prisma.imageAsset.create({
    data: {
      projectId: parsed.projectId,
      imageJobId: job.id,
      label: template ? `${template.name} concept` : "Generated concept",
      kind: parsed.kind,
      prompt,
      outputUrl: generated.outputUrl,
      thumbnailUrl: generated.thumbnailUrl,
      metadata: {
        size: parsed.size,
        templateKey: parsed.templateKey,
        pixverseImageId: generated.externalId,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return { job, image };
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

  const clip = parsed.clipId
    ? await prisma.clip.findUnique({
        where: { id: parsed.clipId },
        include: { videoJob: { select: { pixverseVideoId: true } } },
      })
    : null;
  if (!clip) {
    if (!parsed.inputUrl || !parsed.projectId) {
      throw new Error("Choose a workspace clip or provide a video URL to edit");
    }
  }

  const pixverseVideoId = clip?.videoJob?.pixverseVideoId;
  const sourceUrl =
    pixverseVideoId && /^\d+$/.test(pixverseVideoId)
      ? pixverseVideoId
      : (clip?.outputUrl ?? parsed.inputUrl!);

  const result = await submitVideoEdit({
    mode,
    prompt: parsed.instructions,
    sourceUrl,
  });

  const job = await prisma.videoJob.create({
    data: {
      projectId: clip?.projectId ?? parsed.projectId!,
      mode: mode as VideoJobMode,
      prompt: parsed.instructions,
      pixverseVideoId: result.id,
      status: result.status as VideoJobStatus,
      outputUrl: result.outputUrl,
      thumbnailUrl: result.thumbnailUrl,
    },
  });

  const nextVersion = (clip?.version ?? 0) + 1;
  const newClip = result.outputUrl
    ? await prisma.clip.create({
        data: {
          projectId: clip?.projectId ?? parsed.projectId!,
          videoJobId: job.id,
          parentClipId: clip?.id,
          label: clip ? `${clip.label} v${nextVersion}` : `${mode} output v${nextVersion}`,
          tag: (clip?.tag ?? "FULL") as ClipTag,
          durationSeconds: clip?.durationSeconds ?? 12,
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
