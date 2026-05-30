import { steps } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-zinc-900/8 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="One workflow from product context to saved launch assets"
            description="Launchly turns your landing-page promise into a clear app story: workspace intake, AI brief, template choice, generation, editing, and library save."
          />
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.index} delay={index * 0.08}>
              <div className="flex h-full flex-col rounded-[1.8rem] border border-zinc-900/8 bg-[#f8f7fc] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-700/80">
                  {step.index}
                </p>
                <h3 className="mt-4 font-display text-3xl text-zinc-950">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-zinc-600">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
