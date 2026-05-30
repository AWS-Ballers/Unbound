import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/auth";
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

export const getOptionalViewer = cache(async function getOptionalViewer() {
  const session = await auth();
  const viewer = mapSessionViewer(session);

  if (viewer) {
    return viewer;
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
