import { NextResponse } from "next/server";

import { createStudioJob } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const payload = await createStudioJob("EXTEND", await request.json());
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to extend clip" }, { status: 400 });
  }
}
