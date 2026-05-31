import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { recommendTemplates } from "@/server/generation";

export async function POST(request: Request) {
  try {
    await getViewer();
    const recommendations = await recommendTemplates(await request.json());
    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to recommend templates" }, { status: 400 });
  }
}
