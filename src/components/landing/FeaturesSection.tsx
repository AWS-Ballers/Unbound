import { features } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function FeaturesSection() {
  return (
    <section className="border-b border-zinc-900/8 bg-[#f7f7fb] py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="A landing page that shows the full product system, not just a hero claim"
            description="This redesign emphasizes the core product surfaces you described: workspace management, template-first generation, editing, image creation, and a saved library."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {features.map(({ title, description, icon: Icon }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <div className="flex h-full items-start gap-5 rounded-[1.7rem] border border-zinc-900/8 bg-white p-6 shadow-sm">
                <div className="mt-1 shrink-0 rounded-2xl border border-zinc-900/10 bg-violet-500/8 p-3 shadow-sm">
                  <Icon className="h-5 w-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl text-zinc-950">{title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-zinc-600">
                    {description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
