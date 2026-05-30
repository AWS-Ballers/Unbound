import { faqs } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function FAQSection() {
  return (
    <section id="faq" className="border-b border-zinc-900/8 bg-white py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Handle the fast questions judges and early users will likely ask before they join the beta."
            align="center"
          />
        </Reveal>

        <div className="mt-16 space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.05}>
              <details className="group rounded-[1.4rem] border border-zinc-900/10 bg-white/75 p-6 shadow-sm">
                <summary className="cursor-pointer list-none text-lg text-zinc-950 marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
                  {faq.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
