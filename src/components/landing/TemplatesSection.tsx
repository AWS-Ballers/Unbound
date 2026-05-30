import { templates } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function TemplatesSection() {
  return (
    <section id="templates" className="border-b border-zinc-900/8 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="Templates"
            title="One brief, many cinematic formats"
            description="Every template includes a visual surface so the user understands what they are selecting before generation starts."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {templates.map((template, index) => (
            <Reveal key={template.title} delay={index * 0.05}>
              <article className="group overflow-hidden rounded-[1.75rem] border border-zinc-900/10 bg-white/70 shadow-[0_18px_50px_rgba(90,67,42,0.08)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${template.theme} transition duration-700 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.18),_transparent_26%)]" />
                  <div className="absolute left-5 top-5 h-28 w-20 rounded-[1.4rem] border border-white/20 bg-white/10 blur-[1px]" />
                  <div className="absolute right-5 top-8 h-16 w-24 rounded-[1.25rem] border border-white/25 bg-white/10 backdrop-blur-sm" />
                  <div className="absolute bottom-24 left-5 right-5 h-px bg-white/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241b18]/88 via-[#241b18]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/80">
                      {template.tone}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-violet-100/90">
                      {template.meta}
                    </p>
                    <h3 className="mt-3 font-display text-3xl text-white">
                      {template.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-200">
                      {template.description}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
