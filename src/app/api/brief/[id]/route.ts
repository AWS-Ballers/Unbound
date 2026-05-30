import { NextResponse } from "next/server";

import { updateBriefRecord } from "@/server/generation";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const brief = await updateBriefRecord(id, await request.json());
    return NextResponse.json({ brief });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update brief" }, { status: 400 });
  }
}
