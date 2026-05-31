import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { createPublishPackage } from "@/server/generation";

export async function POST(request: Request) {
  try {
    await getViewer();
    const publishPackage = await createPublishPackage(await request.json());
    return NextResponse.json({ publishPackage });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create publish package" }, { status: 400 });
  }
}
