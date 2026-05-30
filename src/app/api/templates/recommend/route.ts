import { NextResponse } from "next/server";

import { recommendTemplates } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const recommendations = await recommendTemplates(await request.json());
    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to recommend templates" }, { status: 400 });
  }
}
