import { NextResponse } from "next/server";

import { generateVideoJob } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const payload = await generateVideoJob(await request.json());
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate video" }, { status: 400 });
  }
}
