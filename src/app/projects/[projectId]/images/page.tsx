import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, ExternalLink, ImageIcon, Sparkles, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { JsonActionButton } from "@/components/workspace/json-action-button";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);
  const templateKey = workspace.project.activeTemplateKey ?? workspace.recommendations[0]?.templateKey;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Images"
        title="Image concepts"
        description="Generate still concepts from the workspace and active template. Saved assets flow into the library and can be referenced before video generation."
      >
        <div className="flex flex-wrap items-center gap-2">
          <JsonActionButton
            endpoint="/api/generate/image"
            label="Hero image"
            payload={{
              projectId,
              templateKey,
              prompt: `Create a premium hero campaign image for ${workspace.project.name} using the current workspace context.`,
            }}
          />
          <JsonActionButton
            endpoint="/api/generate/image"
            label="Product detail"
            payload={{
              projectId,
              templateKey,
              prompt: `Create a detailed product close-up concept image for ${workspace.project.name}.`,
            }}
          />
          <Link
            href={`/projects/${projectId}/library`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/90 px-3.5 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:bg-[var(--surface-soft)]"
          >
            View library
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PageHeader>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="fade-up rounded-2xl border border-[var(--border)] bg-white/90 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">Hero campaign image</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Launch-ready key visual for landing pages, ads, and social covers.
              </p>
            </div>
          </div>
          <pre className="soft-code mt-4 overflow-x-auto rounded-xl p-3 font-mono text-[11px] leading-5">
            {`template: ${templateKey ?? "default"}
prompt: premium hero for ${workspace.project.name}`}
          </pre>
          <div className="mt-4">
            <JsonActionButton
              endpoint="/api/generate/image"
              label="Generate hero image"
              payload={{
                projectId,
                templateKey,
                prompt: `Create a premium hero campaign image for ${workspace.project.name} using the current workspace context.`,
              }}
            />
          </div>
        </article>

        <article
          className="fade-up rounded-2xl border border-[var(--border)] bg-white/90 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--foreground)]">
              <Wand2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">Product detail shot</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Close-up concept for feature callouts and product storytelling.
              </p>
            </div>
          </div>
          <pre className="soft-code mt-4 overflow-x-auto rounded-xl p-3 font-mono text-[11px] leading-5">
            {`template: ${templateKey ?? "default"}
prompt: product close-up for ${workspace.project.name}`}
          </pre>
          <div className="mt-4">
            <JsonActionButton
              endpoint="/api/generate/image"
              label="Generate product detail"
              payload={{
                projectId,
                templateKey,
                prompt: `Create a detailed product close-up concept image for ${workspace.project.name}.`,
              }}
            />
          </div>
        </article>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Generated concepts</h2>
          <span className="rounded-lg border border-[var(--border)] bg-white/80 px-2.5 py-1 text-xs text-[var(--muted)]">
            {workspace.images.length} saved
          </span>
        </div>

        {workspace.images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-white/60 px-6 py-10 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-[var(--muted)]" />
            <p className="mt-4 text-sm font-medium text-[var(--foreground)]">No images yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Run a generation above — results appear here and in the library.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {workspace.images.map((image, index) => (
              <article
                key={image.id}
                className="fade-up group overflow-hidden rounded-2xl border border-[var(--border)] bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-[var(--border-strong)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                style={{ animationDelay: `${80 + index * 40}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-soft)]">
                  <Image
                    src={image.thumbnailUrl ?? image.outputUrl}
                    alt={image.label}
                    width={1200}
                    height={720}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    {image.kind}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{image.label}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{image.prompt}</p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={image.outputUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </a>
                    <a
                      href={image.outputUrl}
                      download
                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--foreground)] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                    >
                      <Download className="h-3 w-3" />
                      Save
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
