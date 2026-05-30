import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";

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
              Demo route
            </p>
            <h1 className="mt-5 font-display text-5xl leading-tight text-zinc-950">
              Drop your walkthrough here when the product flow is ready.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
              This route is intentionally simple for the MVP. Replace the framed
              surface with a Loom, MP4, or embedded product walkthrough once the
              full Launchly flow is recorded.
            </p>
          </div>

          <div className="flex aspect-video items-center justify-center rounded-[1.75rem] border border-dashed border-zinc-900/15 bg-[#f4ecdf]">
            <div className="text-center">
              <PlayCircle className="mx-auto h-14 w-14 text-violet-600" />
              <p className="mt-4 text-base text-zinc-800">Demo video placeholder</p>
              <p className="mt-2 text-sm text-zinc-500">
                16:9 walkthrough surface
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
