"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/landing/Reveal";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState(
    "Get notified when Launchly opens early access.",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to join the list right now.");
      }

      setStatus("success");
      setMessage(data.message ?? "You are on the list.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to join the list right now.",
      );
    }
  }

  return (
    <section id="early-access" className="bg-[#0b1020] py-24 text-white">
      <Reveal className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(116,74,255,0.22),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.07),_rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(8,14,31,0.35)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/80">
            Early access
          </p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-white sm:text-5xl">
            Ready to launch your product cinematically?
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Join the beta list for the AI-native workflow that turns product
            context into launch-ready videos and images in one workspace.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col gap-4 md:flex-row"
          >
            <label className="sr-only" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              className="min-h-14 flex-1 rounded-full border border-white/10 bg-white px-6 text-zinc-950 outline-none ring-0 placeholder:text-zinc-500 focus:border-violet-500/40"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Joining..." : "Get early access"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p
            className={`mt-4 text-sm ${
              status === "error" ? "text-rose-300" : "text-white/65"
            }`}
          >
            {message}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
