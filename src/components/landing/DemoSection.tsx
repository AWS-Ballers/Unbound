import Link from "next/link";
import { PlayCircle } from "lucide-react";

import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

export function DemoSection() {
  return (
    <section id="demo" className="border-b border-zinc-900/8 bg-[#0c1121] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="Demo"
            title="See Launchly in action"
            description="From product inputs to a saved launch asset in minutes. This section stays ready for your judge-facing walkthrough video."
            tone="light"
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-16">
          <Link
            href="/demo"
            className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
          >
            <div className="relative aspect-[16/9]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_#12152d_0%,_#5f47f5_36%,_#8ce8ff_100%)] transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.18),_transparent_24%)]" />
              <div className="absolute left-[6%] top-[12%] h-[68%] w-[20%] rounded-[2rem] border border-white/18 bg-[#0d1325]/72 backdrop-blur-sm" />
              <div className="absolute left-[10%] top-[18%] h-[10%] w-[12%] rounded-full bg-white/12" />
              <div className="absolute left-[10%] top-[34%] h-[8%] w-[12%] rounded-full bg-white/10" />
              <div className="absolute left-[10%] top-[48%] h-[8%] w-[12%] rounded-full bg-white/10" />
              <div className="absolute right-[8%] top-[16%] h-[56%] w-[62%] rounded-[2rem] border border-white/20 bg-white/12 backdrop-blur-sm" />
              <div className="absolute right-[12%] top-[24%] h-[28%] w-[32%] rounded-[1.6rem] border border-white/18 bg-white/10" />
              <div className="absolute right-[46%] top-[24%] h-[28%] w-[24%] rounded-[1.6rem] border border-white/18 bg-white/8" />
              <div className="absolute right-[12%] bottom-[18%] h-[12%] w-[50%] rounded-full border border-white/20 bg-white/16 backdrop-blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1020]/84 via-[#0d1020]/28 to-transparent" />
            </div>

            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm text-white backdrop-blur">
                <PlayCircle className="h-5 w-5 text-violet-100" />
                Open demo route
              </div>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
                Show the full story here: workspace intake, right-side repo
                chat, template selection, video generation, edit flow, and
                assets saved into library.
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
