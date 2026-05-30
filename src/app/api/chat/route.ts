import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { createWorkspaceChatMessage } from "@/server/chat";

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    const payload = await createWorkspaceChatMessage(await request.json(), viewer.id);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message" },
      { status: 400 },
    );
  }
}
