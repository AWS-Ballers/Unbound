"use client";

import {
  Braces,
  ExternalLink,
  FolderTree,
  Github,
  Loader2,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { GitHubRepoInspection } from "@/lib/github";

type InspectionResponse = {
  inspection: GitHubRepoInspection;
  auth: { linked: boolean; usingToken: boolean };
};

export function GitHubConnector({
  projectId,
  hasGitHubAuth,
  callbackUrl,
}: {
  projectId: string;
  hasGitHubAuth: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [inspecting, setInspecting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [inspection, setInspection] = useState<InspectionResponse | null>(null);

  async function inspectRepository() {
    if (!repoUrl.trim()) return;

    setInspecting(true);
    setInspection(null);

    const response = await fetch("/api/github/inspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl: repoUrl.trim() }),
    });

    setInspecting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to inspect repository");
      return;
    }

    const payload = (await response.json()) as InspectionResponse;
    setInspection(payload);
  }

  async function connectRepository() {
    if (!repoUrl.trim()) return;

    setConnecting(true);

    const response = await fetch("/api/github/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        repoUrl: repoUrl.trim(),
        title: inspection?.inspection.fullName,
      }),
    });

    setConnecting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to connect repository");
      return;
    }

    toast.success("GitHub repository connected and indexed");
    setRepoUrl("");
    setInspection(null);
    router.refresh();
  }

  const preview = inspection?.inspection;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-5 text-white shadow-[0_12px_40px_rgba(15,23,42,0.18)] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Github className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              GitHub connector
            </p>
            <h3 className="mt-1 text-lg font-semibold">Inspect your codebase</h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-white/70">
              Connect a repository to index README, config, and key source files for the workspace
              assistant and generation pipeline.
            </p>
          </div>
        </div>
        {hasGitHubAuth ? (
          <a
            href={`/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/15"
          >
            <Github className="h-4 w-4" />
            {inspection?.auth.linked ? "GitHub linked" : "Link GitHub account"}
          </a>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void inspectRepository();
            }
          }}
          placeholder="https://github.com/owner/repository"
          className="flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/10"
        />
        <button
          type="button"
          onClick={inspectRepository}
          disabled={inspecting || !repoUrl.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-white/90 disabled:opacity-60"
        >
          {inspecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Inspect repo
        </button>
      </div>

      {preview ? (
        <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold">{preview.fullName}</h4>
                {preview.language ? (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
                    {preview.language}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
                  <Star className="h-3 w-3" />
                  {preview.stars}
                </span>
              </div>
              {preview.description ? (
                <p className="mt-2 text-sm leading-6 text-white/70">{preview.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-white/50">
                Branch <span className="font-medium text-white/80">{preview.defaultBranch}</span>
                {" · "}
                {preview.stats.indexedFiles} files indexed of {preview.stats.totalFilesInTree} in
                tree
              </p>
            </div>
            <a
              href={preview.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 transition hover:text-white"
            >
              Open on GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                <FolderTree className="h-3.5 w-3.5" />
                Codebase tree
              </div>
              <ul className="max-h-52 space-y-1 overflow-auto text-xs leading-5 text-white/75">
                {preview.tree.slice(0, 40).map((item) => (
                  <li key={item.path} className="truncate font-mono">
                    {item.path}
                  </li>
                ))}
                {preview.tree.length > 40 ? (
                  <li className="text-white/45">+{preview.tree.length - 40} more paths</li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                <Braces className="h-3.5 w-3.5" />
                Indexed for inspection
              </div>
              <ul className="max-h-52 space-y-1 overflow-auto text-xs leading-5 text-white/75">
                {preview.files.map((file) => (
                  <li key={file.path} className="truncate font-mono">
                    {file.path}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {preview.readmeExcerpt ? (
            <pre className="max-h-40 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-6 text-white/75">
              {preview.readmeExcerpt.slice(0, 1200)}
              {preview.readmeExcerpt.length > 1200 ? "\n…" : ""}
            </pre>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={connectRepository}
              disabled={connecting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
              Connect to workspace
            </button>
            <button
              type="button"
              onClick={() => setInspection(null)}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              Clear preview
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-white/50">
          Public repos work immediately. Link GitHub or set{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">GITHUB_TOKEN</code> for higher limits
          and private repositories.
        </p>
      )}
    </section>
  );
}
