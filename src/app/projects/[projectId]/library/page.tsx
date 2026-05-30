import Image from "next/image";

import { PageHeader } from "@/components/ui/page-header";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

function AssetCard({
  title,
  subtitle,
  imageUrl,
  outputUrl,
  badge,
}: {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  outputUrl: string;
  badge: string;
}) {
  return (
    <article className="panel-card overflow-hidden">
      {imageUrl ? (
        <Image src={imageUrl} alt={title} width={1200} height={720} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-[var(--surface-soft)] text-sm text-[var(--muted)]">
          No preview
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
          </div>
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {badge}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <a href={outputUrl} target="_blank" rel="noreferrer" className="panel-btn panel-btn-ghost">
            Open
          </a>
          <a href={outputUrl} download className="panel-btn panel-btn-primary">
            Download
          </a>
        </div>
      </div>
    </article>
  );
}

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
      <PageHeader
        eyebrow="Library"
        title="Generated images and videos"
        description="Everything created in this workspace lands here — image concepts, launch videos, and edited outputs."
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Images</h3>
          <span className="text-xs text-[var(--muted)]">{workspace.images.length} items</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspace.images.map((image) => (
            <AssetCard
              key={image.id}
              title={image.label}
              subtitle={image.prompt ?? "Generated concept"}
              imageUrl={image.thumbnailUrl ?? image.outputUrl}
              outputUrl={image.outputUrl}
              badge={image.kind}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Videos</h3>
          <span className="text-xs text-[var(--muted)]">{workspace.clips.length} items</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspace.clips.map((clip) => (
            <AssetCard
              key={clip.id}
              title={clip.label}
              subtitle={`Version ${clip.version} · ${clip.durationSeconds}s`}
              imageUrl={clip.thumbnailUrl}
              outputUrl={clip.outputUrl}
              badge={clip.tag}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
