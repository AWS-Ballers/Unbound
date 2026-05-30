import Image from "next/image";

import { getPublicPackage } from "@/server/generation";

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const shared = await getPublicPackage(shareToken);

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-8 md:px-8">
      <section className="surface fade-in relative overflow-hidden rounded-[40px] px-6 py-8 md:px-10 md:py-10">
        <div className="float-soft absolute -left-10 top-0 h-40 w-40 rounded-full bg-[var(--accent-soft)] blur-3xl" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <div className="eyebrow fade-up">Shared preview</div>
            <h1
              className="display-title fade-up mt-5 max-w-4xl text-5xl leading-none text-[var(--foreground)] md:text-7xl"
              style={{ animationDelay: "90ms" }}
            >
              {shared.package.publicTitle ?? shared.project.name}
            </h1>
            <p
              className="fade-up mt-5 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base"
              style={{ animationDelay: "180ms" }}
            >
              {shared.package.publicDescription ?? shared.project.description}
            </p>
          </div>
          <div
            className="surface-strong fade-up rounded-[32px] p-5"
            style={{ animationDelay: "260ms" }}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Package overview
            </p>
            <div className="mt-5 grid gap-3">
              <div className="surface-soft rounded-[22px] px-4 py-3">
                <p className="text-sm text-[var(--muted)]">Project</p>
                <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  {shared.project.name}
                </p>
              </div>
              <div className="surface-soft rounded-[22px] px-4 py-3">
                <p className="text-sm text-[var(--muted)]">Clips included</p>
                <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  {shared.clips.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {shared.clips.map((clip, index) => (
          <article
            key={clip.id}
            className="surface hover-lift fade-up overflow-hidden rounded-[32px]"
            style={{ animationDelay: `${160 + index * 90}ms` }}
          >
            {clip.thumbnailUrl ? (
              <Image
                src={clip.thumbnailUrl}
                alt={clip.label}
                width={1200}
                height={720}
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 items-end bg-[linear-gradient(135deg,rgba(49,89,246,0.16),rgba(255,255,255,0.88),rgba(21,24,33,0.08))] p-6">
                <div className="surface-soft rounded-[24px] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    Preview frame
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {clip.label}
                  </p>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {clip.label}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    A polished launch cut prepared for quick review and approval.
                  </p>
                </div>
                <span className="surface-soft rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                  {clip.tag}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span className="surface-soft rounded-full px-3 py-1.5">
                  Duration {clip.durationSeconds}s
                </span>
                <span className="surface-soft rounded-full px-3 py-1.5">
                  Version {clip.version}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
