import { NextResponse } from "next/server";

import { getPublicPackage } from "@/server/generation";

export async function GET(_: Request, context: { params: Promise<{ shareToken: string }> }) {
  try {
    const { shareToken } = await context.params;
    const payload = await getPublicPackage(shareToken);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Public package not found" }, { status: 404 });
  }
}
