import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0b1020] py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 text-sm text-white/60 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div>
          <p className="font-display text-2xl text-white">Launchly</p>
          <p className="mt-2">
            Turn any product into a launch-ready cinematic experience.
          </p>
        </div>

        <div className="flex flex-wrap gap-5">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/demo" className="transition hover:text-white">
            Demo
          </Link>
          <a href="mailto:hello@launchly.app" className="transition hover:text-white">
            Contact
          </a>
        </div>

        <p>© 2026 Launchly. All rights reserved.</p>
      </div>
    </footer>
  );
}
