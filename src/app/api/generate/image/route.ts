import { NextResponse } from "next/server";

import { generateImageAsset } from "@/server/generation";

export async function POST(request: Request) {
  try {
    const payload = await generateImageAsset(await request.json());
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate image" },
      { status: 400 },
    );
  }
}
