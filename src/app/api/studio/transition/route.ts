import { NextResponse } from "next/server";

import { createStudioJob } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const payload = await createStudioJob("TRANSITION", await request.json());
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create transition" }, { status: 400 });
  }
}
