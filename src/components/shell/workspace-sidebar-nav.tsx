"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  FolderOpenDot,
  Image as ImageIcon,
  LayoutDashboard,
  LibraryBig,
  Upload,
  Video,
  Workflow,
} from "lucide-react";

import {
  WorkspaceSourcesSidebar,
  type WorkspaceSourceItem,
} from "@/components/shell/workspace-sources-sidebar";

type ShellWorkspace = {
  id: string;
  name: string;
  category: string;
};

export type WorkspaceTabIconKey = "sources" | "images" | "generate" | "studio" | "library";

type GlobalTab = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type WorkspaceTab = {
  href: string;
  label: string;
  iconKey: WorkspaceTabIconKey;
};

const globalTabs: GlobalTab[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Workspaces", icon: Upload },
];

const workspaceTabIcons: Record<
  WorkspaceTabIconKey,
  ComponentType<{ className?: string }>
> = {
  sources: FolderOpenDot,
  images: ImageIcon,
  generate: Video,
  studio: Workflow,
  library: LibraryBig,
};

function navLinkClass(active: boolean) {
  return [
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-[var(--foreground)] text-white"
      : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
  ].join(" ");
}

function workspaceLinkClass(active: boolean) {
  return [
    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
      : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
  ].join(" ");
}

function tabLinkClass(active: boolean) {
  return [
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-[var(--accent)] text-white"
      : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
  ].join(" ");
}

export function WorkspaceSidebarNav({
  workspaces,
  currentWorkspaceId,
  workspaceTabs = [],
  workspaceSources = [],
}: {
  workspaces: ShellWorkspace[];
  currentWorkspaceId?: string;
  workspaceTabs?: WorkspaceTab[];
  workspaceSources?: WorkspaceSourceItem[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      <div className="space-y-0.5">
        {globalTabs.map((tab) => {
          const active =
            tab.href === "/dashboard" ? pathname === "/dashboard" : pathname === "/projects";

          return (
            <Link key={tab.href} href={tab.href} className={navLinkClass(active)}>
              <tab.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-[var(--muted)]"}`} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Workspaces
          </p>
          <Link href="/projects" className="text-[11px] font-medium text-[var(--accent)] hover:underline">
            Manage
          </Link>
        </div>
        <div className="space-y-0.5">
          {workspaces.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[var(--muted)]">No workspaces yet</p>
          ) : (
            workspaces.map((workspace) => {
              const active = currentWorkspaceId === workspace.id;
              return (
                <Link
                  key={workspace.id}
                  href={`/projects/${workspace.id}/sources`}
                  className={workspaceLinkClass(active)}
                >
                  <span className="truncate">{workspace.name}</span>
                  <span className="ml-2 shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    {workspace.category}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {currentWorkspaceId && workspaceTabs.length > 0 ? (
        <div>
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Workspace
          </p>
          <div className="space-y-0.5">
            {workspaceTabs.map((tab) => {
              const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              const TabIcon = workspaceTabIcons[tab.iconKey];

              return (
                <Link key={tab.href} href={tab.href} className={tabLinkClass(active)}>
                  <TabIcon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-[var(--muted)]"}`} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {currentWorkspaceId ? (
        <WorkspaceSourcesSidebar projectId={currentWorkspaceId} sources={workspaceSources} />
      ) : null}
    </nav>
  );
}
