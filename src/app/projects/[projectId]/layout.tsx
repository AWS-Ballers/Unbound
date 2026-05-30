import Link from "next/link";
import { BriefcaseBusiness, Clapperboard, FilePenLine, FolderOpenDot, LibraryBig, Sparkles, WandSparkles, Workflow } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

const tabs = [
  { href: "sources", label: "Sources", icon: FolderOpenDot },
  { href: "brief", label: "Brief", icon: FilePenLine },
  { href: "templates", label: "Templates", icon: Sparkles },
  { href: "generate", label: "Generate", icon: Clapperboard },
  { href: "studio", label: "Studio", icon: Workflow },
  { href: "library", label: "Library", icon: LibraryBig },
  { href: "publish", label: "Publish", icon: WandSparkles },
] as const;

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-8">
      <aside className="surface h-fit rounded-[32px] p-5 md:sticky md:top-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-5">
          <Link href="/projects" className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Back to projects
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{workspace.project.name}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{workspace.project.description}</p>
        </div>

        <div className="mt-6 space-y-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={`/projects/${projectId}/${tab.href}`}
              className="surface-strong flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-cyan-400/30 hover:text-[var(--accent)]"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          ))}
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </main>
  );
}
