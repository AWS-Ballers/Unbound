import "./ensure-library-engine";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is missing. Copy .env.example to .env and run `npm run db:up` first.",
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const email = "demo@launchly.app";
  const passwordHash = await bcrypt.hash("Launchly123!", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Launchly Demo",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      passwordHash,
    },
    create: {
      email,
      name: "Launchly Demo",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      passwordHash,
    },
  });

  const organization = await prisma.organization.upsert({
    where: { id: "launchly-demo-org" },
    update: { name: "Launchly Studio", ownerId: user.id },
    create: {
      id: "launchly-demo-org",
      name: "Launchly Studio",
      ownerId: user.id,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "launchly-demo-project" },
    update: {
      name: "Orbit Finance",
      description: "AI bookkeeping for startup finance teams",
      category: "FINANCE",
      activeTemplateKey: "launch-cinematic",
      orgId: organization.id,
    },
    create: {
      id: "launchly-demo-project",
      name: "Orbit Finance",
      description: "AI bookkeeping for startup finance teams",
      category: "FINANCE",
      activeTemplateKey: "launch-cinematic",
      orgId: organization.id,
    },
  });

  await prisma.source.upsert({
    where: { id: "launchly-source-text" },
    update: {
      projectId: project.id,
      type: "TEXT",
      rawLocation: "Founder notes",
      status: "INDEXED",
      indexedData: {
        productName: "Orbit Finance",
        oneSentenceSummary: "AI finance operations for startups",
        keyFeatures: ["Automated bookkeeping", "Cash runway forecasting", "Board-ready reporting"],
        targetAudience: "Seed to Series B founders and finance leads",
        toneHints: ["confident", "precise"],
        visualHints: ["midnight dashboards", "electric cyan accents"],
        sourceKind: "TEXT",
      },
    },
    create: {
      id: "launchly-source-text",
      projectId: project.id,
      type: "TEXT",
      rawLocation: "Founder notes",
      status: "INDEXED",
      indexedData: {
        productName: "Orbit Finance",
        oneSentenceSummary: "AI finance operations for startups",
        keyFeatures: ["Automated bookkeeping", "Cash runway forecasting", "Board-ready reporting"],
        targetAudience: "Seed to Series B founders and finance leads",
        toneHints: ["confident", "precise"],
        visualHints: ["midnight dashboards", "electric cyan accents"],
        sourceKind: "TEXT",
      },
    },
  });

  await prisma.brief.upsert({
    where: { id: "launchly-brief-main" },
    update: {
      projectId: project.id,
      completenessScore: 92,
      data: {
        productName: "Orbit Finance",
        tagline: "Close your books at startup speed",
        productCategory: "Finance automation",
        keyFeatures: ["Automated bookkeeping", "Live runway forecasts", "Investor-ready reporting"],
        valueProposition: "Orbit Finance replaces manual finance ops with an AI operating layer for lean teams.",
        targetAudience: "Seed to Series B startup founders and finance leads",
        toneOfVoice: "Confident, cinematic, precise",
        visualStyle: "Dark premium dashboards, city-at-night lighting, glassy UI overlays",
        primaryCTA: "Book a launch demo",
        differentiators: ["Built for startup velocity", "Finance-specific AI workflows", "Board-quality outputs"],
      },
    },
    create: {
      id: "launchly-brief-main",
      projectId: project.id,
      completenessScore: 92,
      data: {
        productName: "Orbit Finance",
        tagline: "Close your books at startup speed",
        productCategory: "Finance automation",
        keyFeatures: ["Automated bookkeeping", "Live runway forecasts", "Investor-ready reporting"],
        valueProposition: "Orbit Finance replaces manual finance ops with an AI operating layer for lean teams.",
        targetAudience: "Seed to Series B startup founders and finance leads",
        toneOfVoice: "Confident, cinematic, precise",
        visualStyle: "Dark premium dashboards, city-at-night lighting, glassy UI overlays",
        primaryCTA: "Book a launch demo",
        differentiators: ["Built for startup velocity", "Finance-specific AI workflows", "Board-quality outputs"],
      },
    },
  });

  console.log(`Seeded demo project: ${project.name}`);
}

main()
  .catch((error) => {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "P1001") {
      console.error(
        "Cannot reach Postgres at localhost:5432. Start Docker Desktop, then run: npm run db:up",
      );
    } else {
      console.error(error);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
