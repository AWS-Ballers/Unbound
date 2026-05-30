"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type JsonActionButtonProps = {
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  label: string;
  payload?: Record<string, unknown>;
};

export function JsonActionButton({
  endpoint,
  method = "POST",
  label,
  payload,
}: JsonActionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    });
    setPending(false);

    if (!response.ok) {
      const json = await response.json().catch(() => null);
      toast.error(json?.error ?? "Action failed");
      return;
    }

    toast.success("Action completed");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
