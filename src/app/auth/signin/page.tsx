import { LockKeyhole, Sparkles } from "lucide-react";
import { signIn } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="surface w-full max-w-md rounded-[32px] p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Launchly
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            Sign in to your launch workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Use the demo credentials in local mode: `demo@launchly.app` and
            `Launchly123!`.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", formData);
          }}
          className="space-y-4"
        >
          <label className="block space-y-2 text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              name="email"
              type="email"
              defaultValue="demo@launchly.app"
              className="surface-strong w-full rounded-2xl px-4 py-3 outline-none"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-[var(--muted)]">Password</span>
            <input
              name="password"
              type="password"
              defaultValue="Launchly123!"
              className="surface-strong w-full rounded-2xl px-4 py-3 outline-none"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <LockKeyhole className="h-4 w-4" />
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
