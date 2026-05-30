import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const DEMO_VIDEO_SRC = "/PixVerse_V6_Fusion_360P_1_A_cinematic_TVC_comm.mp4";

export default function DemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-8">
      <div className="w-full max-w-5xl rounded-[2rem] border border-zinc-900/10 bg-white/75 p-8 shadow-[0_30px_100px_rgba(90,67,42,0.1)] sm:p-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing page
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-violet-700/80">
              Demo
            </p>
            <h1 className="mt-5 font-display text-5xl leading-tight text-zinc-950">
              See Launchly in action
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
              A sample cinematic launch clip generated with PixVerse from product
              context — the same pipeline you get inside a workspace.
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-zinc-900/10 bg-black shadow-lg">
            <video
              className="aspect-video w-full object-cover"
              src={DEMO_VIDEO_SRC}
              controls
              playsInline
              preload="metadata"
            >
              Your browser does not support embedded video playback.
            </video>
          </div>
        </div>
      </div>
    </main>
  );
}
