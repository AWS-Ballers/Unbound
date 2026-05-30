"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutForm({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className={
        className ??
        "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
      }
    >
      {children ?? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      )}
    </button>
  );
}
