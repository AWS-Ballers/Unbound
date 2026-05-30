import Image from "next/image";
import type { ReactNode } from "react";

import { Library, Sparkles, Upload, Video } from "lucide-react";

import { LogoutForm } from "@/components/auth/logout-form";
import {
  WorkspaceSidebarNav,
  type WorkspaceTabIconKey,
} from "@/components/shell/workspace-sidebar-nav";
import type { WorkspaceSourceItem } from "@/components/shell/workspace-sources-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

type ShellWorkspace = {
  id: string;
  name: string;
  category: string;
};

type ShellTab = {
  href: string;
  label: string;
  iconKey: WorkspaceTabIconKey;
};

export function AuthenticatedShell({
  viewer,
  workspaces,
  currentWorkspace,
  workspaceTabs = [],
  workspaceSources = [],
  children,
  rightPanel,
}: {
  viewer: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    orgName?: string | null;
  };
  workspaces: ShellWorkspace[];
  currentWorkspace?: { id: string; name: string; description?: string | null };
  workspaceTabs?: ShellTab[];
  workspaceSources?: WorkspaceSourceItem[];
  children: ReactNode;
  rightPanel?: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-strong)]">
        <div className="border-b border-[var(--border)] px-4 py-4">
          <div className="flex items-start gap-3">
            {viewer.image ? (
              <Image
                src={viewer.image}
                alt={viewer.name ?? "User"}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                {(viewer.name ?? "U").slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {viewer.name ?? "Workspace user"}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">{viewer.email}</p>
              {viewer.orgName ? (
                <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  {viewer.orgName}
                </p>
              ) : null}
            </div>
            <ThemeToggle />
          </div>
        </div>

        <WorkspaceSidebarNav
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspace?.id}
          workspaceTabs={workspaceTabs}
          workspaceSources={workspaceSources}
        />

        <div className="mt-auto border-t border-[var(--border)] p-4">
          <LogoutForm />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
        </main>

        <aside className="hidden w-[380px] shrink-0 overflow-y-auto border-l border-[var(--border)] bg-[var(--surface-strong)] xl:block">
          {rightPanel ?? (
            <div className="flex h-full flex-col p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Workspace guide</p>
                  <p className="text-xs text-[var(--muted)]">Keep the flow simple and linear.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2.5">
                {[
                  {
                    label: "Workspace",
                    icon: Upload,
                    detail: "Upload files, websites, or repos and let the assistant find missing context.",
                  },
                  {
                    label: "Video",
                    icon: Video,
                    detail: "Choose a template, generate reference images, then create motion.",
                  },
                  {
                    label: "Library",
                    icon: Library,
                    detail: "Save every generated image and video in one searchable place.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
