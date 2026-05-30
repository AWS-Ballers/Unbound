"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { sourceTypes } from "@/lib/contracts";

export function SourceForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<(typeof sourceTypes)[number]>("TEXT");
  const [rawLocation, setRawLocation] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const response = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, type, rawLocation, content }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to add source");
      return;
    }

    toast.success("Source added");
    setRawLocation("");
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-[28px] p-5">
      <div className="grid gap-4 md:grid-cols-4">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as (typeof sourceTypes)[number])}
          className="surface-strong rounded-2xl px-4 py-3 outline-none"
        >
          {sourceTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          value={rawLocation}
          onChange={(event) => setRawLocation(event.target.value)}
          placeholder="URL, path, or source label"
          className="surface-strong rounded-2xl px-4 py-3 outline-none md:col-span-2"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add source
        </button>
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Optional extracted text or product description"
        className="surface-strong mt-4 min-h-28 w-full rounded-2xl px-4 py-3 outline-none"
      />
    </form>
  );
}
