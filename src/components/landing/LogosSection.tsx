import { integrations } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";

export function LogosSection() {
  return (
    <section className="border-b border-zinc-900/8 bg-white/60 py-14">
      <Reveal className="mx-auto flex max-w-7xl flex-col gap-8 px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            Built for teams launching products fast
          </p>
          <p className="max-w-2xl text-sm text-zinc-600">
            One workspace to understand the product, choose the format,
            generate visuals, and save every asset.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {integrations.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-zinc-900/8 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-500/10 p-3">
                  <Icon className="h-5 w-5 text-violet-600" />
                </div>
                <span className="text-lg text-zinc-800">{label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Scans product inputs into one structured brief",
            "Recommends cinematic templates with visual previews",
            "Saves generated videos and images back to Library",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.3rem] border border-zinc-900/8 bg-[#f8f7fc] px-4 py-3 text-sm text-zinc-700"
            >
              {item}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
