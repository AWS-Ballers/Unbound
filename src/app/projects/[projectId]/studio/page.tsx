import Image from "next/image";

import { JsonActionButton } from "@/components/workspace/json-action-button";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);
  const clip = workspace.clips[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-[var(--foreground)]">Studio</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Modify, extend, or transition an existing clip into new launch-ready versions.</p>
      </div>
      {clip ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="surface rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Selected clip</p>
            <div className="mt-4 overflow-hidden rounded-[24px] bg-black/30">
              <Image
                src={
                  clip.thumbnailUrl ??
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                }
                alt={clip.label}
                width={1200}
                height={720}
                className="h-80 w-full object-cover"
              />
            </div>
          </article>
          <article className="surface rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Edit modes</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <JsonActionButton endpoint="/api/studio/modify" label="Modify" payload={{ clipId: clip.id, instructions: "Shift the environment to a midnight city backdrop with reflective glass and sharper rim lighting." }} />
              <JsonActionButton endpoint="/api/studio/extend" label="Extend" payload={{ clipId: clip.id, instructions: "Extend the final shot by 3 seconds and hold on the product dashboard reveal." }} />
              <JsonActionButton endpoint="/api/studio/transition" label="Transition" payload={{ clipId: clip.id, instructions: "Add a cinematic transition into a product macro close-up with cyan highlights." }} />
            </div>
          </article>
        </div>
      ) : (
        <div className="surface rounded-[28px] p-5 text-sm text-[var(--muted)]">Generate a clip first to unlock Studio actions.</div>
      )}
    </div>
  );
}
