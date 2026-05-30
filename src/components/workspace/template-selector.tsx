"use client";

import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type TemplateItem = {
  key: string;
  name: string;
  description: string;
  category: string;
  style: string;
  posterUrl: string;
  capabilities: readonly string[];
};

export function TemplateSelector({
  projectId,
  templates,
  activeTemplateKey,
}: {
  projectId: string;
  templates: readonly TemplateItem[];
  activeTemplateKey?: string | null;
}) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  async function selectTemplate(template: TemplateItem) {
    setPendingKey(template.key);
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activeTemplateKey: template.key,
        templateSettings: {
          templateKey: template.key,
          posterUrl: template.posterUrl,
          posterPrompt: template.style,
          style: template.style,
        },
      }),
    });

    setPendingKey(null);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to update template");
      return;
    }

    toast.success(`${template.name} selected`);
    router.refresh();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {templates.map((template) => {
        const active = activeTemplateKey === template.key;
        const pending = pendingKey === template.key;

        return (
          <button
            key={template.key}
            type="button"
            onClick={() => selectTemplate(template)}
            className={`panel-card overflow-hidden text-left transition hover:-translate-y-0.5 ${
              active ? "ring-2 ring-[var(--accent)]" : ""
            }`}
          >
            <div className="relative">
              <Image
                src={template.posterUrl}
                alt={template.name}
                width={1280}
                height={720}
                className="h-56 w-full object-cover"
              />
              {pending ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : active ? (
                <div className="absolute right-3 top-3 rounded-full bg-white p-2 shadow">
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                </div>
              ) : null}
            </div>
            <div className="p-4">
              <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {template.category}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">{template.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{template.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
