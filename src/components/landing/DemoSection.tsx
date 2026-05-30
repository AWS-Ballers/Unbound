import { Reveal } from "@/components/landing/Reveal";
import { SectionHeading } from "@/components/landing/SectionHeading";

const DEMO_VIDEO_SRC = "/PixVerse_V6_Fusion_360P_1_A_cinematic_TVC_comm.mp4";

export function DemoSection() {
  return (
    <section id="demo" className="border-b border-zinc-900/8 bg-[#0c1121] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <Reveal>
          <SectionHeading
            eyebrow="Demo"
            title="See Launchly in action"
            description="From product context to a cinematic launch clip — watch a sample output generated with PixVerse."
            tone="light"
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-16">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
            <div className="relative aspect-[16/9]">
              <video
                className="h-full w-full object-cover"
                src={DEMO_VIDEO_SRC}
                controls
                playsInline
                preload="metadata"
              >
                Your browser does not support embedded video playback.
              </video>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
