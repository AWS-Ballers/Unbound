"use client";

import { FileUp, Github, Globe, Loader2, Plus, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const sourceTypes = [
  { value: "FILE" as const, label: "File", short: "FILE", icon: FileUp },
  { value: "GITHUB" as const, label: "GitHub", short: "GITHUB", icon: Github },
  { value: "WEBSITE" as const, label: "Website", short: "WEBSITE", icon: Globe },
  { value: "TEXT" as const, label: "Text", short: "TEXT", icon: Type },
];

export function SourceForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<"FILE" | "GITHUB" | "WEBSITE" | "TEXT">("FILE");
  const [title, setTitle] = useState("");
  const [rawLocation, setRawLocation] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    let payloadContent = content;
    let payloadLocation = rawLocation;
    let metadata: Record<string, unknown> | undefined;

    if (type === "FILE" && selectedFile) {
      payloadLocation = selectedFile.name;
      metadata = {
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        sizeBytes: selectedFile.size,
      };

      const canReadInline =
        selectedFile.type.startsWith("text/") ||
        /\.(txt|md|json|csv|js|ts|tsx|jsx|py|html|css)$/i.test(selectedFile.name);

      if (canReadInline) {
        payloadContent = await selectedFile.text();
      }
    }

    const response = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        type,
        title: title || payloadLocation,
        rawLocation: payloadLocation,
        content: payloadContent,
        metadata,
      }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to add source");
      return;
    }

    toast.success("Source added");
    setTitle("");
    setRawLocation("");
    setContent("");
    setSelectedFile(null);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fade-up rounded-2xl border border-[var(--border)] bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[var(--foreground)]">Add a source</p>
        <div
          className="inline-flex w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1 sm:w-auto"
          role="tablist"
          aria-label="Source type"
        >
          {sourceTypes.map((option) => {
            const active = type === option.value;
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setType(option.value)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition sm:flex-initial sm:px-4 ${
                  active
                    ? "bg-white text-[var(--foreground)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-[var(--accent)]" : ""}`} />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {type === "FILE" ? (
        <label className="mb-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)]/60 px-4 py-8 text-center transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/30">
          <input
            type="file"
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <FileUp className="mb-2 h-5 w-5 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            {selectedFile ? selectedFile.name : "Drop a file or click to browse"}
          </span>
          <span className="mt-1 text-xs text-[var(--muted)]">PDFs, docs, code, and product assets</span>
        </label>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Source title"
          className="rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        />
        {type !== "FILE" ? (
          <input
            value={rawLocation}
            onChange={(event) => setRawLocation(event.target.value)}
            placeholder={
              type === "GITHUB"
                ? "https://github.com/org/repo"
                : type === "WEBSITE"
                  ? "https://product-site.com"
                  : "Source label or note"
            }
            className="rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            required
          />
        ) : (
          <div className="hidden md:block" aria-hidden />
        )}
        <button
          type="submit"
          disabled={pending || (type === "FILE" ? !selectedFile : !rawLocation)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add source
        </button>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={
          type === "TEXT"
            ? "Paste product notes, onboarding copy, pricing details, or any raw source material"
            : type === "FILE"
              ? "Optional notes about this upload"
              : "Optional context or extracted text"
        }
        className="mt-3 min-h-24 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
    </form>
  );
}
