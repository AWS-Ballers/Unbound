import { z } from "zod";

import { prisma } from "@/lib/db";
import { env, flags } from "@/lib/env";
import {
  buildGitHubSourceContent,
  buildGitHubSourceMetadata,
  inspectGitHubRepository,
} from "@/lib/github";
import { getDemoWorkspace } from "@/lib/mock-data";

const inspectSchema = z.object({
  repoUrl: z.string().min(8),
});

export async function getGitHubAccessTokenForViewer(viewerId: string) {
  if (env.githubToken) {
    return env.githubToken;
  }

  if (flags.isDemoMode || !flags.hasDatabase) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: { userId: viewerId, provider: "github" },
    select: { access_token: true },
  });

  return account?.access_token ?? null;
}

export async function inspectGitHubRepoForViewer(viewerId: string, input: unknown) {
  const { repoUrl } = inspectSchema.parse(input);
  const accessToken = await getGitHubAccessTokenForViewer(viewerId);
  return inspectGitHubRepository(repoUrl, accessToken);
}

export function getConnectedGitHubSources(
  sources: Array<{
    id: string;
    type: string;
    title: string | null;
    rawLocation: string;
    status: string;
    metadata: unknown;
    indexedData: unknown;
    createdAt: string;
  }>,
) {
  return sources.filter((source) => source.type === "GITHUB");
}

export async function connectGitHubRepoToProject(
  viewerId: string,
  projectId: string,
  repoUrl: string,
  title?: string,
) {
  const accessToken = await getGitHubAccessTokenForViewer(viewerId);
  const inspection = await inspectGitHubRepository(repoUrl, accessToken);
  const content = buildGitHubSourceContent(inspection);
  const metadata = buildGitHubSourceMetadata(inspection);

  if (flags.isDemoMode) {
    return {
      id: `source_github_${Date.now()}`,
      projectId,
      type: "GITHUB" as const,
      title: title ?? inspection.fullName,
      rawLocation: inspection.url,
      metadata,
      indexedData: {
        productName: inspection.repo,
        oneSentenceSummary: inspection.description ?? `GitHub repository ${inspection.fullName}`,
        keyFeatures: inspection.files.slice(0, 4).map((file) => file.path),
        sourceKind: "GITHUB",
      },
      status: "INDEXED" as const,
      createdAt: new Date().toISOString(),
    };
  }

  const { summarizeSourceWithOpenAi } = await import("@/lib/openai");
  const summary = await summarizeSourceWithOpenAi({
    type: "GITHUB",
    rawLocation: inspection.url,
    content,
  });

  const existing = await prisma.project.findFirst({
    where: { id: projectId, org: { ownerId: viewerId } },
  });

  if (!existing) {
    throw new Error("Workspace not found");
  }

  return prisma.source.create({
    data: {
      projectId,
      type: "GITHUB",
      title: title ?? inspection.fullName,
      rawLocation: inspection.url,
      metadata: metadata as object,
      indexedData: summary as object,
      status: "INDEXED",
    },
  });
}

export function getDemoGitHubInspection(repoUrl: string) {
  const workspace = getDemoWorkspace("demo-project");
  const githubSource = workspace.sources.find((source) => source.type === "GITHUB");

  return {
    owner: "example",
    repo: "orbit-finance",
    fullName: "example/orbit-finance",
    url: repoUrl.includes("github.com") ? repoUrl : "https://github.com/example/orbit-finance",
    description: githubSource?.indexedData
      ? "Demo repository connected for codebase inspection."
      : "Premium finance launch workspace codebase.",
    defaultBranch: "main",
    homepage: null,
    language: "TypeScript",
    stars: 128,
    readmeExcerpt:
      "# Orbit Finance\n\nLaunch-ready fintech workspace with dashboards, onboarding, and growth surfaces.",
    tree: [
      { path: "README.md" },
      { path: "package.json" },
      { path: "src/app/page.tsx" },
      { path: "src/components/dashboard.tsx" },
      { path: "src/lib/pricing.ts" },
      { path: "prisma/schema.prisma" },
    ],
    files: [
      {
        path: "README.md",
        content: "# Orbit Finance\nDemo codebase excerpt for inspection.",
      },
      {
        path: "package.json",
        content: '{ "name": "orbit-finance", "private": true }',
      },
    ],
    stats: { totalFilesInTree: 142, indexedFiles: 2 },
  };
}
