import { calculateCompletenessScore, type BriefData, type SourceSummary } from "@/lib/contracts";
import { templateCatalog } from "@/lib/templates";

export const demoViewer = {
  id: "demo-user",
  email: "demo@launchly.app",
  name: "Launchly Demo",
  image:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  orgId: "launchly-demo-org",
  orgName: "Launchly Studio",
};

const brief: BriefData = {
  productName: "Orbit Finance",
  tagline: "Close your books at startup speed",
  productCategory: "Finance automation",
  keyFeatures: ["Automated bookkeeping", "Live runway forecasts", "Board-ready reporting"],
  valueProposition: "Orbit Finance replaces manual finance ops with an AI operating layer for lean startup teams.",
  targetAudience: "Seed to Series B startup founders and finance leads",
  toneOfVoice: "Confident, premium, cinematic, precise",
  visualStyle: "Midnight city lighting, glassy dashboards, premium cyan highlights, dramatic transitions",
  primaryCTA: "Book a launch demo",
  differentiators: ["Built for startup speed", "Finance-specific AI workflows", "Investor-grade outputs"],
};

const sourceSummaries: SourceSummary[] = [
  {
    productName: "Orbit Finance",
    oneSentenceSummary: "AI finance operations for scaling startups",
    keyFeatures: ["Automated bookkeeping", "Cash runway forecasting", "Board reporting"],
    targetAudience: "Founders and finance operators",
    toneHints: ["confident", "direct"],
    visualHints: ["premium dark UI", "city-night atmosphere"],
    rawTextExcerpt: "Orbit Finance gives lean teams a finance operating system powered by AI.",
    sourceKind: "TEXT",
  },
  {
    productName: "Orbit Finance",
    oneSentenceSummary: "Fast financial close automation from repo and docs insights",
    keyFeatures: ["Automated categorization", "Exception handling", "Forecast dashboards"],
    targetAudience: "Finance leads",
    toneHints: ["precise", "high-trust"],
    visualHints: ["glassy panels", "clean charts"],
    rawTextExcerpt: "The product centers on fast close, runway, and investor visibility.",
    sourceKind: "WEBSITE",
  },
];

export type DemoSidebarSource = {
  id: string;
  type: string;
  title: string;
  status: string;
};

export type DemoProjectListItem = {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  category: string;
  activeTemplateKey: string | null;
  createdAt: string;
  updatedAt: string;
  sources: DemoSidebarSource[];
  metrics: { sources: number; clips: number; completeness: number };
};

const demoSidebarSourcesByProject: Record<string, DemoSidebarSource[]> = {
  "launchly-demo-project": [
    { id: "source-text", type: "TEXT", title: "Founder positioning notes", status: "INDEXED" },
    { id: "source-website", type: "WEBSITE", title: "Orbit website", status: "INDEXED" },
    { id: "source-github", type: "GITHUB", title: "example/orbit-finance", status: "INDEXED" },
  ],
  "launchly-saas-project": [
    { id: "signal-docs", type: "FILE", title: "Product analytics playbook.pdf", status: "INDEXED" },
    { id: "signal-site", type: "WEBSITE", title: "signalstack.io", status: "INDEXED" },
  ],
};

export function getDemoSidebarSources(projectId: string) {
  return [...(demoSidebarSourcesByProject[projectId] ?? [])];
}

const seededDemoProjects: DemoProjectListItem[] = [
  {
    id: "launchly-demo-project",
    orgId: demoViewer.orgId,
    name: "Orbit Finance",
    description: "AI bookkeeping and runway forecasting for startup finance teams",
    category: "FINANCE",
    activeTemplateKey: "launch-cinematic",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    sources: getDemoSidebarSources("launchly-demo-project"),
    metrics: {
      sources: 3,
      clips: 2,
      completeness: calculateCompletenessScore(brief),
    },
  },
  {
    id: "launchly-saas-project",
    orgId: demoViewer.orgId,
    name: "Signal Stack",
    description: "Realtime product analytics for growth teams",
    category: "SAAS",
    activeTemplateKey: "social-ad",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    sources: getDemoSidebarSources("launchly-saas-project"),
    metrics: {
      sources: 2,
      clips: 1,
      completeness: 78,
    },
  },
];

const createdDemoProjects = new Map<string, DemoProjectListItem>();

export function registerCreatedDemoProject(project: DemoProjectListItem) {
  createdDemoProjects.set(project.id, project);
}

export function getDemoProjects() {
  const merged = new Map<string, DemoProjectListItem>();
  for (const project of seededDemoProjects) {
    merged.set(project.id, project);
  }
  for (const project of createdDemoProjects.values()) {
    merged.set(project.id, project);
  }
  return [...merged.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function buildTemplateRecommendations() {
  return templateCatalog.slice(0, 3).map((template, index) => ({
    templateKey: template.key,
    confidence: [0.94, 0.88, 0.79][index] ?? 0.7,
    reasoning:
      index === 0
        ? "Best fit for a premium finance launch with high-contrast product storytelling."
        : index === 1
          ? "Strong commercial framing if the team wants broader brand-market energy."
          : "Useful for explaining the product clearly without losing cinematic polish.",
  }));
}

function buildEmptyDemoWorkspace(project: DemoProjectListItem) {
  return {
    viewer: demoViewer,
    project: {
      id: project.id,
      orgId: project.orgId,
      name: project.name,
      description: project.description,
      category: project.category,
      activeTemplateKey: project.activeTemplateKey,
      generationDefaults: { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" },
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    sources: [],
    brief: null,
    recommendations: buildTemplateRecommendations(),
    jobs: [],
    imageJobs: [],
    images: [],
    clips: [],
    chatThread: {
      id: `thread-${project.id}`,
      title: `${project.name} workspace chat`,
      messages: [
        {
          id: `message-system-${project.id}`,
          role: "SYSTEM",
          content:
            "Welcome to your workspace. Add sources, choose a template, and use the assistant to shape image and video generation.",
          citations: null,
          createdAt: new Date().toISOString(),
        },
      ],
    },
    publishPackage: null,
  };
}

export function getDemoWorkspace(projectId = "launchly-demo-project") {
  const created = createdDemoProjects.get(projectId);
  if (created) {
    return buildEmptyDemoWorkspace(created);
  }

  const projectMeta =
    seededDemoProjects.find((project) => project.id === projectId) ?? seededDemoProjects[0];

  if (projectId === "launchly-saas-project") {
    return {
      viewer: demoViewer,
      project: {
        id: projectId,
        orgId: demoViewer.orgId,
        name: projectMeta.name,
        description: projectMeta.description,
        category: projectMeta.category,
        activeTemplateKey: projectMeta.activeTemplateKey,
        generationDefaults: { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" },
        createdAt: projectMeta.createdAt,
        updatedAt: projectMeta.updatedAt,
      },
      sources: [
        {
          id: "signal-docs",
          type: "FILE",
          title: "Product analytics playbook.pdf",
          rawLocation: "Product analytics playbook.pdf",
          metadata: null,
          status: "INDEXED",
          indexedData: sourceSummaries[0],
          createdAt: new Date().toISOString(),
        },
        {
          id: "signal-site",
          type: "WEBSITE",
          title: "signalstack.io",
          rawLocation: "https://signalstack.io",
          metadata: null,
          status: "INDEXED",
          indexedData: sourceSummaries[1],
          createdAt: new Date().toISOString(),
        },
      ],
      brief: null,
      recommendations: buildTemplateRecommendations(),
      jobs: [],
      imageJobs: [],
      images: [],
      clips: [],
      chatThread: {
        id: "thread-signal",
        title: "Signal Stack workspace chat",
        messages: [
          {
            id: "message-system-signal",
            role: "SYSTEM",
            content:
              "Welcome to Signal Stack. Add product docs or connect analytics repos to ground generation.",
            citations: null,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      publishPackage: null,
    };
  }

  const recommendations = buildTemplateRecommendations();

  return {
    viewer: demoViewer,
    project: {
      id: projectId,
      orgId: demoViewer.orgId,
      name: projectMeta.name,
      description: projectMeta.description,
      category: projectMeta.category,
      activeTemplateKey: projectMeta.activeTemplateKey,
      generationDefaults: { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" },
      createdAt: projectMeta.createdAt,
      updatedAt: projectMeta.updatedAt,
    },
    sources: [
            {
              id: "source-text",
              type: "TEXT",
              title: "Founder positioning notes",
              rawLocation: "Founder positioning notes",
              metadata: null,
              status: "INDEXED",
              indexedData: sourceSummaries[0],
              createdAt: new Date().toISOString(),
            },
            {
              id: "source-website",
              type: "WEBSITE",
              title: "Orbit website",
              rawLocation: "https://orbitfinance.app",
              metadata: null,
              status: "INDEXED",
              indexedData: sourceSummaries[1],
              createdAt: new Date().toISOString(),
            },
            {
              id: "source-github",
              type: "GITHUB",
              title: "example/orbit-finance",
              rawLocation: "https://github.com/example/orbit-finance",
              metadata: {
                connector: "github",
                fullName: "example/orbit-finance",
                branch: "main",
                language: "TypeScript",
                stats: { totalFilesInTree: 142, indexedFiles: 18 },
                treePreview: ["README.md", "package.json", "src/app/page.tsx", "src/lib/pricing.ts"],
                indexedPaths: ["README.md", "package.json", "src/app/page.tsx", "src/lib/pricing.ts"],
              },
              status: "INDEXED",
              indexedData: sourceSummaries[0],
              createdAt: new Date().toISOString(),
            },
          ],
    brief: {
      id: "brief-main",
      data: brief,
      completenessScore: calculateCompletenessScore(brief),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    recommendations,
    jobs: [
      {
        id: "job-ready",
        mode: "TEXT2VIDEO",
        prompt:
          "A premium cinematic launch film for Orbit Finance, dark glass dashboards, city-at-night atmosphere, precise camera dolly, cool cyan lighting, confident mood.",
        status: "READY",
        settings: { durationSeconds: 12, aspectRatio: "16:9", style: "Cinematic" },
        outputUrl: "https://storage.example.com/launchly/orbit-finance-hero.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        createdAt: new Date().toISOString(),
      },
      {
        id: "job-processing",
        mode: "MODIFY",
        prompt: "Restyle the background to a midnight skyline with soft reflections.",
        status: "PROCESSING",
        settings: { durationSeconds: 12, aspectRatio: "16:9", style: "Neo-noir" },
        outputUrl: null,
        thumbnailUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    imageJobs: [
      {
        id: "image-job-1",
        prompt: "Premium Orbit Finance campaign still with bright white studio lighting and a focused product dashboard reveal.",
        status: "READY",
        settings: { size: "landscape_16_9", templateKey: "launch-cinematic" },
        outputUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20fintech%20campaign%20still%2C%20white%20studio%20lighting%2C%20clean%20dashboard%20reveal%2C%20realistic%20product%20advertising&image_size=landscape_16_9",
        thumbnailUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20fintech%20campaign%20still%2C%20white%20studio%20lighting%2C%20clean%20dashboard%20reveal%2C%20realistic%20product%20advertising&image_size=landscape_16_9",
        createdAt: new Date().toISOString(),
      },
    ],
    images: [
      {
        id: "image-hero",
        imageJobId: "image-job-1",
        label: "Orbit hero concept",
        kind: "GENERATED",
        prompt: "Premium Orbit Finance campaign still with bright white studio lighting and a focused product dashboard reveal.",
        outputUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20fintech%20campaign%20still%2C%20white%20studio%20lighting%2C%20clean%20dashboard%20reveal%2C%20realistic%20product%20advertising&image_size=landscape_16_9",
        thumbnailUrl:
          "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20fintech%20campaign%20still%2C%20white%20studio%20lighting%2C%20clean%20dashboard%20reveal%2C%20realistic%20product%20advertising&image_size=landscape_16_9",
        metadata: { size: "landscape_16_9" },
        createdAt: new Date().toISOString(),
      },
    ],
    clips: [
      {
        id: "clip-hero",
        videoJobId: "job-ready",
        label: "Hero launch cut",
        tag: "HERO",
        durationSeconds: 12,
        version: 1,
        outputUrl: "https://storage.example.com/launchly/orbit-finance-hero.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        createdAt: new Date().toISOString(),
      },
      {
        id: "clip-social",
        videoJobId: "job-ready",
        label: "Social teaser",
        tag: "SOCIAL",
        durationSeconds: 9,
        version: 1,
        outputUrl: "https://storage.example.com/launchly/orbit-finance-social.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        createdAt: new Date().toISOString(),
      },
    ],
    chatThread: {
      id: "thread-main",
      title: "Orbit workspace chat",
      messages: [
        {
          id: "message-system",
          role: "SYSTEM",
          content: "Welcome back. Add sources, choose a template, then generate image and video concepts from the workspace context.",
          citations: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "message-assistant",
          role: "ASSISTANT",
          content: "You are one source away from a stronger product narrative. Add the GitHub repo or upload pricing and onboarding docs next.",
          citations: ["source-website", "source-text"],
          createdAt: new Date().toISOString(),
        },
      ],
    },
    publishPackage: {
      id: "package-main",
      shareToken: "share-orbit-finance",
      status: "REVIEW",
      publicTitle: "Orbit Finance Launch Preview",
      publicDescription: "A cinematic preview package for the Orbit Finance launch campaign.",
      createdAt: new Date().toISOString(),
    },
  };
}
