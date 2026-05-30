import { NextResponse } from "next/server";

import { createSourceRecord } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const source = await createSourceRecord(await request.json());
    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create source" }, { status: 400 });
  }
}
