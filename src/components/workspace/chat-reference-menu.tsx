"use client";

import { FileText, FolderKanban, Image as ImageIcon, Video } from "lucide-react";

import type { ChatReferenceOption } from "@/lib/chat-references";

const kindIcons = {
  workspace: FolderKanban,
  source: FileText,
  clip: Video,
  image: ImageIcon,
} as const;

export function ChatReferenceMenu({
  options,
  query,
  highlightedIndex,
  onSelect,
}: {
  options: ChatReferenceOption[];
  query: string;
  highlightedIndex: number;
  onSelect: (option: ChatReferenceOption) => void;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = options.filter((option) => {
    if (!normalizedQuery) return true;
    const haystack = `${option.label} ${option.description ?? ""} ${option.kind}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  if (!filtered.length) {
    return (
      <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-2xl border border-[var(--border)] bg-white p-3 text-xs text-[var(--muted)] shadow-lg">
        No workspaces or files match “{query}”.
      </div>
    );
  }

  return (
    <div className="absolute bottom-full left-0 right-0 z-20 mb-2 max-h-56 overflow-auto rounded-2xl border border-[var(--border)] bg-white p-1 shadow-lg">
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        Reference with /
      </p>
      {filtered.map((option, index) => {
        const Icon = kindIcons[option.kind];
        return (
          <button
            key={`${option.kind}:${option.id}`}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(option);
            }}
            className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
              index === highlightedIndex
                ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                : "hover:bg-[var(--surface-soft)]"
            }`}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--accent)]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-[var(--foreground)]">
                {option.label}
              </span>
              <span className="block truncate text-xs text-[var(--muted)]">
                {option.description ?? option.kind}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
