import { ExternalLink, FileText, Github, Globe, Type } from "lucide-react";

type WorkspaceSource = {
  id: string;
  type: string;
  title: string | null;
  rawLocation: string;
  status: string;
  metadata: unknown;
  indexedData: unknown;
};

const icons = {
  FILE: FileText,
  GITHUB: Github,
  WEBSITE: Globe,
  TEXT: Type,
} as const;

type GitHubMetadata = {
  fullName?: string;
  branch?: string;
  language?: string | null;
  stats?: { totalFilesInTree?: number; indexedFiles?: number };
  treePreview?: string[];
  indexedPaths?: string[];
};

function GitHubSourceCard({
  source,
  metadata,
}: {
  source: WorkspaceSource;
  metadata: GitHubMetadata;
}) {
  return (
    <article className="panel-card overflow-hidden p-0">
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                GitHub · Connected
              </p>
              <h4 className="mt-1 text-base font-semibold">
                {metadata.fullName ?? source.title ?? source.rawLocation}
              </h4>
              <p className="mt-1 text-sm text-white/65">
                {metadata.branch ? `Branch ${metadata.branch}` : null}
                {metadata.language ? ` · ${metadata.language}` : null}
                {metadata.stats?.indexedFiles
                  ? ` · ${metadata.stats.indexedFiles} files indexed`
                  : null}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {source.status}
            </span>
            <a
              href={source.rawLocation}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-white/75 transition hover:text-white"
            >
              View repo
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {metadata.indexedPaths?.length ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Indexed paths
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-xs text-[var(--foreground)]">
              {metadata.indexedPaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {metadata.treePreview?.length ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Repository tree preview
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-xs text-[var(--muted)]">
              {metadata.treePreview.slice(0, 20).map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {source.indexedData ? (
        <pre className="soft-code mx-5 mb-5 max-h-40 overflow-auto rounded-xl p-4 text-xs leading-6">
          {JSON.stringify(source.indexedData, null, 2)}
        </pre>
      ) : null}
    </article>
  );
}

export function SourceList({ sources }: { sources: WorkspaceSource[] }) {
  if (!sources.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6 text-sm text-[var(--muted)]">
        No sources yet. Connect GitHub or add files to ground the workspace assistant.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => {
        if (source.type === "GITHUB") {
          return (
            <div key={source.id} id={`source-${source.id}`} className="scroll-mt-24">
              <GitHubSourceCard
                source={source}
                metadata={(source.metadata ?? {}) as GitHubMetadata}
              />
            </div>
          );
        }

        const Icon = icons[source.type as keyof typeof icons] ?? FileText;

        return (
          <article key={source.id} id={`source-${source.id}`} className="panel-card scroll-mt-24 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {source.type}
                  </p>
                  <h4 className="mt-1 text-base font-semibold text-[var(--foreground)]">
                    {source.title ?? source.rawLocation}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">{source.rawLocation}</p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                {source.status}
              </span>
            </div>
            {source.indexedData ? (
              <pre className="soft-code mt-4 max-h-48 overflow-auto rounded-xl p-4 text-xs leading-6">
                {JSON.stringify(source.indexedData, null, 2)}
              </pre>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
