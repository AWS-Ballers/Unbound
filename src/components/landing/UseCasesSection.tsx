import { useCases } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function UseCasesSection() {
  return (
    <section className="border-b border-zinc-900/8 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="Use cases"
            title="Built for any product: SaaS, finance, e-commerce, and more"
            description="Because Launchly begins with source understanding, the same workflow can flex across product categories without changing your whole toolchain."
          />
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {useCases.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <div className="h-full rounded-[1.6rem] border border-zinc-900/10 bg-[#f8f7fc] p-7 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-violet-700/80">
                  0{index + 1}
                </p>
                <h3 className="mt-5 font-display text-3xl text-zinc-950">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-zinc-600">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
