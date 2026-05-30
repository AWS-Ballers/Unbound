import Link from "next/link";

const links = [
  { label: "Workspace", href: "#workspace" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Templates", href: "#templates" },
  { label: "Demo", href: "#demo" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1020]/78 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-sm font-semibold text-white">
              L
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl leading-none text-white sm:text-2xl">
                Launchly
              </p>
              <p className="hidden text-[11px] uppercase tracking-[0.24em] text-white/55 min-[420px]:block">
                AI launch video workspace
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/68 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#demo"
              className="hidden items-center justify-center rounded-full border border-white/14 bg-white/6 px-4 py-2.5 text-sm font-medium text-white/88 transition hover:bg-white/10 sm:inline-flex"
            >
              Watch demo
            </a>
            <a
              href="#early-access"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-white/90 sm:px-5"
            >
              <span className="sm:hidden">Beta</span>
              <span className="hidden sm:inline">Get early access</span>
            </a>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 pb-4 text-sm text-white/72 md:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="shrink-0 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
