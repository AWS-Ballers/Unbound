import { redirect } from "next/navigation";

import { getOptionalViewer } from "@/lib/auth";

export default async function Home() {
  const viewer = await getOptionalViewer();
  redirect(viewer ? "/dashboard" : "/auth/signin");
}
