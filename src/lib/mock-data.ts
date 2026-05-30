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

export function getDemoProjects() {
  return [
    {
      id: "launchly-demo-project",
      orgId: demoViewer.orgId,
      name: "Orbit Finance",
      description: "AI bookkeeping and runway forecasting for startup finance teams",
      category: "FINANCE",
      activeTemplateKey: "launch-cinematic",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
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
      metrics: {
        sources: 2,
        clips: 1,
        completeness: 78,
      },
    },
  ];
}

export function getDemoWorkspace(projectId = "launchly-demo-project") {
  const recommendations = templateCatalog.slice(0, 3).map((template, index) => ({
    templateKey: template.key,
    confidence: [0.94, 0.88, 0.79][index] ?? 0.7,
    reasoning:
      index === 0
        ? "Best fit for a premium finance launch with high-contrast product storytelling."
        : index === 1
          ? "Strong commercial framing if the team wants broader brand-market energy."
          : "Useful for explaining the product clearly without losing cinematic polish.",
  }));

  return {
    viewer: demoViewer,
    project: {
      id: projectId,
      orgId: demoViewer.orgId,
      name: "Orbit Finance",
      description: "AI bookkeeping and runway forecasting for startup finance teams",
      category: "FINANCE",
      activeTemplateKey: "launch-cinematic",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    sources: [
      {
        id: "source-text",
        type: "TEXT",
        rawLocation: "Founder positioning notes",
        status: "INDEXED",
        indexedData: sourceSummaries[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: "source-website",
        type: "WEBSITE",
        rawLocation: "https://orbitfinance.app",
        status: "INDEXED",
        indexedData: sourceSummaries[1],
        createdAt: new Date().toISOString(),
      },
      {
        id: "source-github",
        type: "GITHUB",
        rawLocation: "https://github.com/example/orbit-finance",
        status: "SCANNING",
        indexedData: null,
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
