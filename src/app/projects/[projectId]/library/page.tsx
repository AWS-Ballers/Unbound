import Image from "next/image";

import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-[var(--foreground)]">Clip library</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Every generated or edited output lands here with tags, versions, and thumbnail previews.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspace.clips.map((clip) => (
          <article key={clip.id} className="surface overflow-hidden rounded-[28px]">
            <Image
              src={
                clip.thumbnailUrl ??
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
              }
              alt={clip.label}
              width={1200}
              height={720}
              className="h-52 w-full object-cover"
            />
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{clip.label}</h3>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">{clip.tag}</span>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                v{clip.version} - {clip.durationSeconds}s
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
