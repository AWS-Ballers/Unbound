"use client";

import { Download, Loader2, Upload, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const actions = [
  { key: "modify", label: "Modify", endpoint: "/api/studio/modify" },
  { key: "extend", label: "Extend", endpoint: "/api/studio/extend" },
  { key: "transition", label: "Transition", endpoint: "/api/studio/transition" },
] as const;

export function StudioActions({
  projectId,
  clips,
  selectedClipId,
  onSelectClip,
}: {
  projectId: string;
  clips: Array<{ id: string; label: string; outputUrl?: string }>;
  selectedClipId?: string;
  onSelectClip?: (clipId: string) => void;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [clipId, setClipId] = useState(selectedClipId ?? clips[0]?.id ?? "");

  useEffect(() => {
    if (selectedClipId) {
      setClipId(selectedClipId);
    }
  }, [selectedClipId]);

  function handleClipChange(nextId: string) {
    setClipId(nextId);
    onSelectClip?.(nextId);
  }
  const [inputUrl, setInputUrl] = useState("");
  const [instructions, setInstructions] = useState(
    "Polish the lighting, sharpen the motion, and make the output feel more premium and launch-ready.",
  );
  const [lastOutputUrl, setLastOutputUrl] = useState<string | null>(null);

  const selectedClip = clips.find((clip) => clip.id === clipId);

  async function runAction(endpoint: string, label: string) {
    const activeClipId = selectedClipId ?? clipId;
    if (!activeClipId && !inputUrl.trim()) {
      toast.error("Choose a workspace video or paste a video URL first");
      return;
    }

    setPendingAction(label);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        clipId: activeClipId || undefined,
        inputUrl: inputUrl || undefined,
        instructions,
      }),
    });
    setPendingAction(null);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? `Unable to ${label.toLowerCase()} video`);
      return;
    }

    const payload = await response.json();
    const outputUrl = payload?.clip?.outputUrl ?? payload?.job?.outputUrl ?? null;
    if (outputUrl) {
      setLastOutputUrl(outputUrl);
    }

    toast.success(`${label} job created — saved to Library when ready`);
    router.refresh();
  }

  return (
    <div className="panel-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        PixVerse edit flow
      </p>

      <div className="mt-4 grid gap-3">
        <label className="block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Workspace video</span>
          <select
            value={selectedClipId ?? clipId}
            onChange={(event) => handleClipChange(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none"
          >
            <option value="">Choose a workspace video</option>
            {clips.map((clip) => (
              <option key={clip.id} value={clip.id}>
                {clip.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Or upload / remote URL</span>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
            <Upload className="h-4 w-4 text-[var(--muted)]" />
            <input
              value={inputUrl}
              onChange={(event) => setInputUrl(event.target.value)}
              placeholder="https://... or path to uploaded video"
              className="w-full bg-transparent text-[var(--foreground)] outline-none"
            />
          </div>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Edit instructions</span>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => runAction(action.endpoint, action.label)}
            disabled={pendingAction !== null}
            className="panel-btn panel-btn-primary"
          >
            {pendingAction === action.label ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {action.label}
          </button>
        ))}
      </div>

      {(lastOutputUrl || selectedClip?.outputUrl) && (
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">Download edited video</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Finished outputs are also saved in the Library tab.
          </p>
          <a
            href={lastOutputUrl ?? selectedClip?.outputUrl}
            download
            className="panel-btn panel-btn-ghost mt-3 inline-flex"
          >
            <Download className="h-4 w-4" />
            Download video
          </a>
        </div>
      )}
    </div>
  );
}
