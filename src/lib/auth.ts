import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { flags } from "@/lib/env";
import { demoViewer } from "@/lib/mock-data";

export async function getViewer() {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? demoViewer.email,
      name: session.user.name ?? demoViewer.name,
      image: session.user.image ?? demoViewer.image,
      orgId: demoViewer.orgId,
      orgName: demoViewer.orgName,
    };
  }

  if (flags.isDemoMode) {
    return demoViewer;
  }

  redirect("/auth/signin");
}
