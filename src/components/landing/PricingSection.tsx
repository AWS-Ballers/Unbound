import { pricing } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-zinc-900/8 bg-[#0f1425] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing for teams of all sizes"
            description="Optional for the MVP, but useful on the landing page to show how the product could scale after early access."
            tone="light"
          />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {pricing.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.08}>
              <div
                className={`h-full rounded-[1.75rem] border p-7 ${
                  tier.featured
                    ? "border-violet-400/35 bg-violet-500/10 shadow-[0_20px_60px_rgba(116,74,255,0.18)]"
                    : "border-white/10 bg-white/6 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-3xl text-white">{tier.name}</h3>
                  {tier.featured ? (
                    <span className="rounded-full border border-violet-300/24 bg-violet-400/16 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-100">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 text-5xl text-white">{tier.price}</p>
                <p className="mt-4 text-base leading-7 text-white/70">
                  {tier.description}
                </p>
                <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  {tier.features.map((feature) => (
                    <p key={feature} className="text-sm text-white/82">
                      {feature}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
