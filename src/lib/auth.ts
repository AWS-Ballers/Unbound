import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { flags } from "@/lib/env";
import { demoViewer } from "@/lib/mock-data";

function mapSessionViewer(session: {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
} | null) {
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? demoViewer.email,
    name: session.user.name ?? demoViewer.name,
    image: session.user.image ?? demoViewer.image,
    orgId: demoViewer.orgId,
    orgName: demoViewer.orgName,
  };
}

async function resolveDatabaseViewer(viewer: {
  id: string;
  email: string;
  name: string;
  image: string;
  orgId: string;
  orgName: string;
}) {
  if (!flags.hasDatabase || flags.isDemoMode) {
    return viewer;
  }

  if (viewer.id !== demoViewer.id) {
    const org = await prisma.organization.findFirst({
      where: { ownerId: viewer.id },
      orderBy: { createdAt: "asc" },
    });

    return {
      ...viewer,
      orgId: org?.id ?? viewer.orgId,
      orgName: org?.name ?? viewer.orgName,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: viewer.email.toLowerCase() },
    include: {
      organizations: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });

  if (!user) {
    return viewer;
  }

  const org = user.organizations[0];

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? viewer.name,
    image: user.image ?? viewer.image,
    orgId: org?.id ?? viewer.orgId,
    orgName: org?.name ?? viewer.orgName,
  };
}

export const getOptionalViewer = cache(async function getOptionalViewer() {
  const session = await auth();
  const mapped = mapSessionViewer(session);

  if (mapped) {
    return resolveDatabaseViewer(mapped);
  }

  if (flags.isDemoMode) {
    return demoViewer;
  }

  return null;
});

export async function getViewer() {
  const viewer = await getOptionalViewer();

  if (viewer) {
    return viewer;
  }

  redirect("/auth/signin");
}
