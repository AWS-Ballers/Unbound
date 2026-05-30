import { LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInWithCredentials, signInWithGitHub } from "@/app/auth/signin/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getOptionalViewer } from "@/lib/auth";
import { flags } from "@/lib/env";

const errorMessages: Record<string, string> = {
  CredentialsSignin:
    "Invalid email or password. If this is your first time, start Postgres and run `npm run db:seed`.",
  CallbackRouteError:
    "Sign-in failed. Check that Postgres is running and `DATABASE_URL` in `.env` is correct.",
  Configuration: "Auth is misconfigured. Check NEXTAUTH_SECRET and NEXTAUTH_URL in `.env`.",
  Default: "Unable to sign in. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const viewer = await getOptionalViewer();
  const { error } = await searchParams;

  if (viewer) {
    redirect("/dashboard");
  }

  const errorMessage = error
    ? (errorMessages[error] ?? errorMessages.Default)
    : null;

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-md panel-card p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Launchly
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Sign in to continue
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Access your dashboard, workspaces, and media pipeline after authentication.
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-800"
          >
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-3 rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs leading-5 text-[var(--muted)]">
          Dev account: <code className="font-mono">demo@launchly.app</code> /{" "}
          <code className="font-mono">Launchly123!</code>
          {flags.hasDatabase ? (
            <>
              {" "}
              — requires Postgres (
              <code className="font-mono">npm run db:seed</code> on first run).
            </>
          ) : null}
        </p>

        <form action={signInWithCredentials} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[var(--muted)]">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue="demo@launchly.app"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              required
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[var(--muted)]">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="Launchly123!"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              required
            />
          </label>

          <button type="submit" className="panel-btn panel-btn-primary w-full">
            <LockKeyhole className="h-4 w-4" />
            Sign in
          </button>
        </form>

        {flags.hasGitHubAuth ? (
          <form className="mt-3" action={signInWithGitHub}>
            <button type="submit" className="panel-btn panel-btn-ghost w-full">
              Continue with GitHub
            </button>
          </form>
        ) : null}

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
