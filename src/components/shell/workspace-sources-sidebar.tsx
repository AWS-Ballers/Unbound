import Link from "next/link";
import { FileText, Github, Globe, Plus, Type } from "lucide-react";

export type WorkspaceSourceItem = {
  id: string;
  type: string;
  title: string;
  status: string;
};

const icons = {
  FILE: FileText,
  GITHUB: Github,
  WEBSITE: Globe,
  TEXT: Type,
} as const;

function statusClass(status: string) {
  if (status === "INDEXED") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (status === "FAILED") {
    return "bg-red-500/10 text-red-700 dark:text-red-400";
  }
  return "bg-amber-500/10 text-amber-800 dark:text-amber-300";
}

export function WorkspaceSourcesSidebar({
  projectId,
  sources,
}: {
  projectId: string;
  sources: WorkspaceSourceItem[];
}) {
  const sourcesHref = `/projects/${projectId}/sources`;
  const visible = sources.slice(0, 10);
  const overflow = sources.length - visible.length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Sources
        </p>
        <Link
          href={sourcesHref}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:underline"
        >
          <Plus className="h-3 w-3" />
          Add
        </Link>
      </div>

      {sources.length === 0 ? (
        <Link
          href={sourcesHref}
          className="mx-1 block rounded-lg border border-dashed border-[var(--border)] px-3 py-3 text-xs leading-5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
        >
          No sources yet. Connect GitHub or upload files.
        </Link>
      ) : (
        <ul className="space-y-0.5">
          {visible.map((source) => {
            const Icon = icons[source.type as keyof typeof icons] ?? FileText;

            return (
              <li key={source.id}>
                <Link
                  href={`${sourcesHref}#source-${source.id}`}
                  className="group flex items-start gap-2.5 rounded-lg px-3 py-2 transition hover:bg-[var(--surface-soft)]"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-soft)] text-[var(--accent)] group-hover:bg-white">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-[var(--foreground)]">
                      {source.title}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                        {source.type}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusClass(source.status)}`}
                      >
                        {source.status}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          {overflow > 0 ? (
            <li>
              <Link
                href={sourcesHref}
                className="block px-3 py-2 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                +{overflow} more sources
              </Link>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
