"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { StudioActions } from "@/components/workspace/studio-actions";

export type StudioClip = {
  id: string;
  label: string;
  outputUrl: string;
  thumbnailUrl?: string | null;
  tag: string;
  version: number;
  durationSeconds: number;
};

export function StudioEditor({
  projectId,
  clips,
}: {
  projectId: string;
  clips: StudioClip[];
}) {
  const [selectedId, setSelectedId] = useState(clips[0]?.id ?? "");

  const selected = useMemo(
    () => clips.find((clip) => clip.id === selectedId) ?? clips[0] ?? null,
    [clips, selectedId],
  );

  if (clips.length === 0) {
    return (
      <div className="panel-card p-6">
        <StudioActions projectId={projectId} clips={[]} />
        <p className="mt-4 text-sm text-[var(--muted)]">
          No workspace videos yet. Generate one in the Video tab, or paste a remote URL in the form
          below.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <section className="panel-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Choose a video to edit
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Select a workspace clip below. The preview updates before you run PixVerse edit actions.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {clips.map((clip) => {
              const active = clip.id === selected?.id;
              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => setSelectedId(clip.id)}
                  className={`overflow-hidden rounded-xl border text-left transition ${
                    active
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="relative aspect-video bg-[var(--surface-soft)]">
                    {clip.thumbnailUrl ? (
                      <Image
                        src={clip.thumbnailUrl}
                        alt={clip.label}
                        width={640}
                        height={360}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                        No thumbnail
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                      {clip.tag}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {clip.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      v{clip.version} · {clip.durationSeconds}s
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selected ? (
          <article className="panel-card overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Preview
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">{selected.label}</h3>
            </div>
            <div className="bg-[var(--surface-soft)]">
              {selected.thumbnailUrl ? (
                <Image
                  src={selected.thumbnailUrl}
                  alt={selected.label}
                  width={1200}
                  height={720}
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center text-sm text-[var(--muted)]">
                  Preview unavailable
                </div>
              )}
            </div>
            {selected.outputUrl ? (
              <div className="border-t border-[var(--border)] px-5 py-4">
                <a
                  href={selected.outputUrl}
                  download
                  className="panel-btn panel-btn-primary inline-flex"
                >
                  Download selected video
                </a>
              </div>
            ) : null}
          </article>
        ) : null}
      </div>

      <StudioActions
        projectId={projectId}
        clips={clips.map((clip) => ({
          id: clip.id,
          label: clip.label,
          outputUrl: clip.outputUrl,
        }))}
        selectedClipId={selected?.id}
        onSelectClip={setSelectedId}
      />
    </div>
  );
}
