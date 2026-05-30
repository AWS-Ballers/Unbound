import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

import { NewProjectForm } from "@/components/projects/new-project-form";
import { AuthenticatedShell } from "@/components/shell/authenticated-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getViewer } from "@/lib/auth";
import { listProjectsForViewer } from "@/server/projects";

export default async function ProjectsPage() {
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
          eyebrow="Workspaces"
          title="Create and manage launch workspaces"
          description="Each workspace holds sources, generated images, videos, edits, and library assets."
        />

        <section className="panel-card p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">New workspace</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Name your product launch, then upload sources or connect GitHub.
          </p>
          <div className="mt-4">
            <NewProjectForm />
          </div>
        </section>

        <section className="panel-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Open workspaces</h2>
            <span className="text-xs text-[var(--muted)]">{projects.length} total</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/sources`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <FolderKanban className="h-5 w-5 text-[var(--accent)]" />
                  <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {project.category}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">{project.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{project.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AuthenticatedShell>
  );
}
