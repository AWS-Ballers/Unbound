import { problems } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function ProblemSection() {
  return (
    <section className="border-b border-zinc-900/8 bg-[#fffdf9] py-24">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="Launching a product video is still slow, expensive, and fragmented."
            description="Teams are not missing creative ambition. They are missing one product-aware workflow that can absorb context and turn it into launch assets without chaos."
          />
        </Reveal>

        <Reveal delay={0.08} className="grid gap-6">
          {problems.map((problem, index) => (
            <div
              key={problem}
              className="rounded-[1.7rem] border border-zinc-900/8 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-5">
                <span className="font-display text-4xl text-zinc-400">
                  0{index + 1}
                </span>
                <p className="max-w-xl text-lg leading-8 text-zinc-600">
                  {problem}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
