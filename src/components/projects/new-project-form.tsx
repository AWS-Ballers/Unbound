"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { projectCategories } from "@/lib/contracts";

export function NewProjectForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<(typeof projectCategories)[number]>("SAAS");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, category }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to create project");
      return;
    }

    toast.success("Project created");
    setName("");
    setDescription("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface rounded-[28px] p-5 md:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            New project
          </p>
          <p className="text-sm text-[var(--muted)]">
            Start from sources, then move through the launch workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          className="surface-strong col-span-1 rounded-2xl px-4 py-3 outline-none"
          required
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short description"
          className="surface-strong col-span-1 rounded-2xl px-4 py-3 outline-none md:col-span-1"
        />
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as (typeof projectCategories)[number])
          }
          className="surface-strong rounded-2xl px-4 py-3 outline-none"
        >
          {projectCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Create project
      </button>
    </form>
  );
}
