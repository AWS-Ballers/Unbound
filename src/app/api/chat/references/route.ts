import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth";
import { listChatReferenceOptions } from "@/server/chat-references";

export async function GET(request: Request) {
  try {
    const viewer = await getViewer();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const options = await listChatReferenceOptions(viewer.id, projectId);
    return NextResponse.json({ options });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load references" },
      { status: 400 },
    );
  }
}
