import Link from "next/link";
import { ArrowRight, FolderKanban, Image as ImageIcon, Video } from "lucide-react";

import { AuthenticatedShell } from "@/components/shell/authenticated-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getViewer } from "@/lib/auth";
import { listProjectsForViewer } from "@/server/projects";

export default async function DashboardPage() {
  const viewer = await getViewer();
  const projects = await listProjectsForViewer(viewer.id);

  return (
    <AuthenticatedShell
      viewer={viewer}
      workspaces={projects.map((project) => ({
        id: project.id,
        name: project.name,
        category: project.category,
        sources: project.sources,
      }))}
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Dashboard"
          title="Your launch workspaces"
          description="Create a workspace, add sources, generate images and video, then edit and download from the library."
          actions={
            <Link href="/projects" className="panel-btn panel-btn-primary">
              New workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Workspaces", value: String(projects.length), icon: FolderKanban },
            { label: "Pipeline", value: "Sources → Video", icon: Video },
            { label: "Assets", value: "Library", icon: ImageIcon },
          ].map((item) => (
            <div key={item.label} className="panel-card p-4">
              <item.icon className="h-5 w-5 text-[var(--accent)]" />
              <p className="mt-4 text-xs text-[var(--muted)]">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="panel-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Continue working</h2>
            <Link href="/projects" className="text-sm font-medium text-[var(--accent)]">
              View all
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/sources`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:bg-white"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {project.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{project.name}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-full bg-white px-2.5 py-1">{project.metrics.sources} sources</span>
                  <span className="rounded-full bg-white px-2.5 py-1">{project.metrics.clips} videos</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AuthenticatedShell>
  );
}
