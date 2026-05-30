import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { integrations } from "@/components/landing/landing-content";
import { Reveal } from "@/components/landing/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0b1020] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.28),_transparent_34%),radial-gradient(circle_at_right,_rgba(77,208,255,0.18),_transparent_28%),linear-gradient(180deg,_#0b1020_0%,_#0d1325_55%,_#11172b_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.04)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 md:min-h-[calc(100svh-73px)] md:py-16 lg:px-12 lg:py-20">
        <Reveal className="mx-auto flex max-w-4xl flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/72 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Turn product context into launch-ready video
          </div>

          <h1 className="mt-8 max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            Turn any product into a launch-ready cinematic experience.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
            Launchly scans your repo, website, docs, and assets, builds a
            product brief, recommends cinematic templates, and generates videos
            and images from one AI-native workspace.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#early-access"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-white/92"
            >
              Get early access
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              <PlayCircle className="h-4 w-4" />
              Watch how it works
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: "5 input types", label: "Repos, docs, URLs, files, text" },
              { value: "10 templates", label: "Launch cinematic to social ad" },
              { value: "1 library", label: "Save generated videos and images" },
            ].map((stat) => (
              <div
                key={stat.value}
                className="rounded-3xl border border-white/12 bg-white/6 p-4 backdrop-blur"
              >
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {integrations.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/75 shadow-sm backdrop-blur"
              >
                <Icon className="h-4 w-4 text-cyan-300" />
                {label}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
