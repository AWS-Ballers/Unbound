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
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="surface rounded-[32px] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Shared preview</p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--foreground)]">{shared.package.publicTitle ?? shared.project.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{shared.package.publicDescription ?? shared.project.description}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {shared.clips.map((clip) => (
          <article key={clip.id} className="surface overflow-hidden rounded-[28px]">
            <Image
              src={
                clip.thumbnailUrl ??
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
              }
              alt={clip.label}
              width={1200}
              height={720}
              className="h-72 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">{clip.label}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {clip.tag} - {clip.durationSeconds}s
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
