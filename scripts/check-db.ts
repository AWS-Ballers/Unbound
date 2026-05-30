import { PrismaClient } from "@prisma/client";
import { flags } from "../src/lib/env";

const prisma = new PrismaClient();

async function main() {
  console.log("DEMO_MODE flag:", flags.isDemoMode);
  console.log("hasDatabase:", flags.hasDatabase);

  const count = await prisma.project.count();
  const users = await prisma.user.count();
  console.log("DB connected: yes");
  console.log("Users:", users);
  console.log("Projects:", count);

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    take: 10,
  });
  console.log("Project names:", projects.map((p) => p.name).join(", ") || "(none)");
}

main()
  .catch((error) => {
    console.error("DB connected: no");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
