import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Sora } from "next/font/google";
import Script from "next/script";

import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/** Prisma needs the Node query engine; the edge/WASM client rejects postgresql:// URLs. */
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Launchly | AI Launch Videos",
  description:
    "Turn any product into a launch-ready cinematic experience with AI-powered briefs, templates, and video generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${newsreader.variable} ${plexMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <Script id="launchly-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`}
        </Script>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
