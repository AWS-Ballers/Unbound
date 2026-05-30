"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { BriefData } from "@/lib/contracts";

export function BriefEditor({
  briefId,
  initialData,
}: {
  briefId: string;
  initialData: BriefData;
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  async function saveBrief() {
    const response = await fetch(`/api/brief/${briefId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to save brief");
      return;
    }

    toast.success("Brief saved");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["productName", "Product name"],
          ["tagline", "Tagline"],
          ["productCategory", "Product category"],
          ["targetAudience", "Target audience"],
          ["toneOfVoice", "Tone of voice"],
          ["visualStyle", "Visual style"],
          ["primaryCTA", "Primary CTA"],
        ].map(([key, label]) => (
          <label key={key} className="block space-y-2 text-sm">
            <span className="font-medium text-[var(--muted)]">{label}</span>
            <input
              value={data[key as keyof BriefData] as string}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              className="surface-strong w-full rounded-2xl px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:bg-white"
            />
          </label>
        ))}
      </div>

      {[
        ["valueProposition", "Value proposition"],
        ["keyFeatures", "Key features (comma-separated)"],
        ["differentiators", "Differentiators (comma-separated)"],
      ].map(([key, label]) => (
        <label key={key} className="block space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">{label}</span>
          <textarea
            value={
              Array.isArray(data[key as keyof BriefData])
                ? (data[key as keyof BriefData] as string[]).join(", ")
                : (data[key as keyof BriefData] as string)
            }
            onChange={(event) =>
              setData((current) => ({
                ...current,
                [key]: key === "valueProposition"
                  ? event.target.value
                  : event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
              }))
            }
            className="surface-strong min-h-24 w-full rounded-2xl px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:bg-white"
          />
        </label>
      ))}

      <button
        type="button"
        onClick={saveBrief}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
      >
        <Save className="h-4 w-4" />
        Save brief
      </button>
    </div>
  );
}
