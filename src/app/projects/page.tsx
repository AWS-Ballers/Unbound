import Link from "next/link";
import { ArrowUpRight, FolderKanban, Sparkles, Video } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { NewProjectForm } from "@/components/projects/new-project-form";
import { getViewer } from "@/lib/auth";
import { listProjectsForViewer } from "@/server/projects";

export default async function ProjectsPage() {
  const viewer = await getViewer();
  const projects = await listProjectsForViewer(viewer.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8">
      <section className="surface grid-overlay relative overflow-hidden rounded-[32px] p-6 md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Launchly
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
              Build launch videos from the product you already have.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
              Scan repos, websites, and docs. Generate a product brief, choose a
              cinematic template, and ship launch-ready PixVerse video cuts from
              one workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--muted)]">
              {viewer.name}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FolderKanban,
            label: "Projects",
            value: `${projects.length}`,
            hint: "Active launch workspaces",
          },
          {
            icon: Sparkles,
            label: "AI systems",
            value: "OpenAI",
            hint: "Briefs, templates, prompts",
          },
          {
            icon: Video,
            label: "Video pipeline",
            value: "PixVerse",
            hint: "Generation and edits",
          },
        ].map((item) => (
          <div key={item.label} className="surface rounded-[28px] p-5">
            <item.icon className="h-5 w-5 text-[var(--accent)]" />
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.hint}</p>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <NewProjectForm />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Project portfolio
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Open a workspace to manage sources, briefs, jobs, and published packages.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/sources`}
              className="surface group rounded-[28px] p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/30"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                  {project.category}
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition group-hover:text-[var(--accent)]" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">
                {project.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {project.description}
              </p>
              <div className="mt-6 flex gap-3 text-xs text-[var(--muted)]">
                <span>{project.metrics.sources} sources</span>
                <span>{project.metrics.clips} clips</span>
                <span>{project.metrics.completeness}% brief</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
