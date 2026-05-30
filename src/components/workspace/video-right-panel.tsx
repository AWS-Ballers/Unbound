"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, SkipForward, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  generationDefaultsSchema,
  normalizeVideoDuration,
  videoDurationOptions,
} from "@/lib/contracts";
import type { z } from "zod";

type GenerationDefaults = z.infer<typeof generationDefaultsSchema>;

export function VideoRightPanel({
  projectId,
  activeTemplateKey,
  defaultTemplateKey,
  generationDefaults,
}: {
  projectId: string;
  activeTemplateKey?: string | null;
  defaultTemplateKey: string;
  generationDefaults: GenerationDefaults;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"skip" | "generate" | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(() =>
    normalizeVideoDuration(generationDefaults.durationSeconds),
  );

  async function generateVideo(templateKey: string) {
    const response = await fetch("/api/generate/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        templateKey,
        settings: {
          durationSeconds,
          aspectRatio: generationDefaults.aspectRatio,
          style: generationDefaults.style,
        },
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? "Unable to generate video");
    }
  }

  async function handleSkip() {
    setPending("skip");
    try {
      await generateVideo(activeTemplateKey ?? defaultTemplateKey);
      toast.success("Video generation started with the default template");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate video");
    } finally {
      setPending(null);
    }
  }

  async function handleGenerate() {
    setPending("generate");
    try {
      await generateVideo(activeTemplateKey ?? defaultTemplateKey);
      toast.success("Video generation started");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate video");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="right-panel">
      <div className="right-panel-body">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Video setup</p>
            <p className="text-xs text-[var(--muted)]">Pick a template in the center, or skip to generate.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--muted)]">Selected template</span>
            <span className="font-medium text-[var(--foreground)]">
              {activeTemplateKey ?? "Default"}
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-[var(--muted)]">Duration</span>
            <div
              className="inline-flex w-full flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-white/80 p-1"
              role="radiogroup"
              aria-label="Video duration"
            >
              {videoDurationOptions.map((seconds) => {
                const active = durationSeconds === seconds;

                return (
                  <button
                    key={seconds}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDurationSeconds(seconds)}
                    className={`min-w-[3.25rem] flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--foreground)] text-white shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {seconds}s
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--muted)]">Aspect ratio</span>
            <span className="font-medium text-[var(--foreground)]">16:9</span>
          </div>
        </div>

        <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
          Templates include preview posters so you can choose a visual direction. When generation
          finishes, the clip is saved to your workspace library.
        </p>
      </div>

      <div className="right-panel-footer">
        <Link href={`/projects/${projectId}/sources`} className="panel-btn panel-btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={pending !== null}
            className="panel-btn panel-btn-ghost"
          >
            {pending === "skip" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SkipForward className="h-4 w-4" />
            )}
            Skip
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={pending !== null}
            className="panel-btn panel-btn-primary"
          >
            {pending === "generate" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
