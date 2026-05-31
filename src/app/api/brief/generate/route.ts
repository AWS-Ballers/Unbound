import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { generateBriefRecord } from "@/server/generation";

export async function POST(request: Request) {
  try {
    await getViewer();
    const brief = await generateBriefRecord(await request.json());
    return NextResponse.json({ brief });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate brief" }, { status: 400 });
  }
}
