"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  Bot,
  CheckCircle2,
  Clapperboard,
  FileUp,
  FolderKanban,
  Github,
  ImageIcon,
  Library,
  MessageSquareText,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type SidebarTab = "workspace" | "video" | "edit" | "image" | "library";
type TemplateId = "launch" | "tvc" | "demo";

const tabs: Array<{
  id: SidebarTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "workspace", label: "Workspace", icon: FolderKanban },
  { id: "video", label: "Video", icon: Clapperboard },
  { id: "edit", label: "Edit", icon: WandSparkles },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "library", label: "Library", icon: Library },
];

const templateCards: Array<{
  id: TemplateId;
  name: string;
  meta: string;
  gradient: string;
}> = [
  {
    id: "launch",
    name: "Launch Cinematic",
    meta: "16:9 • 45s",
    gradient: "from-[#16152d] via-[#5c43f5] to-[#8fe8ff]",
  },
  {
    id: "tvc",
    name: "TVC",
    meta: "16:9 • 30s",
    gradient: "from-[#28160e] via-[#b56636] to-[#f6d28f]",
  },
  {
    id: "demo",
    name: "Product Demo",
    meta: "16:9 • 60s",
    gradient: "from-[#10263c] via-[#3175d8] to-[#c1f0ff]",
  },
];

function SidebarButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-white text-zinc-950 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-violet-600" : "text-white/60"}`} />
      <span>{label}</span>
    </button>
  );
}

function WorkspacePanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: "124", label: "Repo files indexed" },
            { value: "8", label: "Source types synced" },
            { value: "92%", label: "Brief completeness" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-zinc-900/8 bg-[#f7f8fc] p-4"
            >
              <p className="text-2xl font-semibold text-zinc-950">{item.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[1.8rem] border border-zinc-900/8 bg-[#f7f8fc] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Source intake
              </p>
              <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                Upload files or connect product context
              </h3>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <FileUp className="h-5 w-5 text-violet-600" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "GitHub repository",
              "Website URL",
              "Docs / PDFs / slides",
              "Screenshots & logos",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-zinc-900/8 bg-white px-4 py-3 text-sm text-zinc-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-zinc-900/8 bg-[#111827] p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <MessageSquareText className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">
              Repo copilot
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Suggest more sources to strengthen the launch brief
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl bg-white/7 p-4 text-sm text-white/78">
            I found the GitHub repo and docs. Add the pricing page, product
            screenshots, and recent release notes for a stronger video brief.
          </div>
          <div className="rounded-2xl bg-violet-500/14 p-4 text-sm text-white/90">
            Great. Also pull the homepage hero, dashboard screenshots, and
            customer quote deck into this workspace.
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/72">
            <span>Add GitHub README, docs.launchly.app, pricing page...</span>
            <Bot className="h-4 w-4 text-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPanel({
  selectedTemplate,
  onSelectTemplate,
}: {
  selectedTemplate: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.8rem] border border-zinc-900/8 bg-[#f7f8fc] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Template step
              </p>
              <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                Choose a cinematic template or skip
              </h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
              Optional
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {templateCards.map((template) => {
              const selected = template.id === selectedTemplate;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectTemplate(template.id)}
                  className={`group overflow-hidden rounded-[1.4rem] border text-left transition ${
                    selected
                      ? "border-violet-500/50 shadow-[0_18px_50px_rgba(92,67,245,0.16)]"
                      : "border-zinc-900/8 hover:border-zinc-900/18"
                  }`}
                >
                  <div className={`relative aspect-[4/5] bg-gradient-to-br ${template.gradient}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_28%),linear-gradient(180deg,_transparent_20%,rgba(15,23,42,0.82)_100%)]" />
                    <div className="absolute left-4 top-4 h-20 w-16 rounded-[1rem] border border-white/20 bg-white/12 backdrop-blur-sm" />
                    <div className="absolute right-4 top-6 h-10 w-20 rounded-full border border-white/20 bg-white/12" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/75">
                        {template.meta}
                      </p>
                      <h4 className="mt-2 text-lg font-semibold">{template.name}</h4>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-zinc-900/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Generation summary
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">
            Workspace → brief → prompt → video
          </h3>
          <div className="mt-5 space-y-3">
            {[
              "Reference current workspace sources",
              "Apply selected template or continue without one",
              "Generate PixVerse-ready launch prompt",
              "Save final clip back to Library",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-[#f7f8fc] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                <span className="text-sm text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.6rem] border border-zinc-900/8 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-zinc-900/10 px-5 py-3 text-sm font-medium text-zinc-700"
        >
          Back
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-900/10 px-5 py-3 text-sm font-medium text-zinc-700"
          >
            Skip template
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Generate video
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.8rem] border border-zinc-900/8 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          Input sources
        </p>
        <h3 className="mt-2 text-lg font-semibold text-zinc-950">
          Upload a video or reference one from the workspace
        </h3>
        <div className="mt-5 space-y-3">
          {[
            "Upload MP4 / MOV from your device",
            "Open a generated clip from the workspace library",
            "Choose edit mode: modify, extend, transition, or restyle",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-[#f7f8fc] px-4 py-3 text-sm text-zinc-700">
              {item}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Download edited video
        </button>
      </div>

      <div className="rounded-[1.8rem] border border-zinc-900/8 bg-[#111827] p-5 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">
          PixVerse edit actions
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {["Modify", "Extend", "Restyle"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/6 p-4"
            >
              <p className="text-sm font-semibold">{item}</p>
              <p className="mt-2 text-xs leading-6 text-white/65">
                Adjust footage while keeping the workspace brief in context.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
          <div className="aspect-[16/9] rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,_#1f1a43_0%,_#6045f4_42%,_#8ee8ff_100%)]" />
          <div className="mt-4 flex items-center justify-between text-sm text-white/70">
            <span>Edited clip will be saved to Library</span>
            <span>Version 03</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImagePanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="rounded-[1.8rem] border border-zinc-900/8 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          Image generation
        </p>
        <h3 className="mt-2 text-lg font-semibold text-zinc-950">
          Create supporting stills from the same product brief
        </h3>
        <div className="mt-5 rounded-[1.5rem] border border-zinc-900/8 bg-[#f7f8fc] p-4 text-sm text-zinc-700">
          Generate a premium hero still for Launchly with layered UI glass,
          gradient lighting, floating captions, and a cinematic product reveal.
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {["16:9 cover", "9:16 story", "1:1 social", "Ad variant"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-zinc-900/8 bg-[#f7f8fc] px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-600"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[1.7rem] border border-zinc-900/8 bg-white p-3"
          >
            <div className="aspect-[4/5] rounded-[1.2rem] bg-[linear-gradient(135deg,_#16152d_0%,_#5f47f5_42%,_#92e8ff_100%)]" />
            <p className="mt-3 text-sm text-zinc-700">Generated still 0{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryPanel() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Asset library
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">
            New videos and images are saved back here automatically
          </h3>
        </div>
        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700">
          12 assets saved
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Launch cinematic", type: "Video", theme: "from-[#16152d] via-[#5f47f5] to-[#8ce8ff]" },
          { label: "Vertical social cut", type: "Video", theme: "from-[#260f2d] via-[#cf4dda] to-[#ffc7f3]" },
          { label: "Campaign still", type: "Image", theme: "from-[#10263c] via-[#3175d8] to-[#c1f0ff]" },
        ].map((asset) => (
          <article
            key={asset.label}
            className="overflow-hidden rounded-[1.7rem] border border-zinc-900/8 bg-white"
          >
            <div className={`aspect-[4/3] bg-gradient-to-br ${asset.theme}`} />
            <div className="p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {asset.type}
              </p>
              <h4 className="mt-2 text-base font-semibold text-zinc-950">
                {asset.label}
              </h4>
              <p className="mt-2 text-sm text-zinc-600">
                Saved from workspace generation flow
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function HeroWorkspacePreview() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("workspace");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("launch");

  const panelCopy = useMemo(
    () =>
      ({
        workspace: {
          title: "Workspace intelligence",
          badge: "GitHub + docs + chat",
          description:
            "Create workspaces, ingest product context, and use the right-side copilot to add better sources.",
        },
        video: {
          title: "Template-driven generation",
          badge: "Choose or skip",
          description:
            "Review visual templates, go back, skip the step, or generate directly from the structured brief.",
        },
        edit: {
          title: "PixVerse editing loop",
          badge: "Modify • Extend • Restyle",
          description:
            "Edit uploaded or generated videos, download outputs, and keep every version attached to the workspace.",
        },
        image: {
          title: "Image generation",
          badge: "Campaign stills",
          description:
            "Generate supporting launch imagery from the same product understanding used for video creation.",
        },
        library: {
          title: "Workspace library",
          badge: "Saved outputs",
          description:
            "Generated videos and images flow back into a searchable library for re-use, review, and export.",
        },
      })[activeTab],
    [activeTab],
  );

  return (
    <div
      id="workspace"
      className="relative w-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/80 p-4 text-zinc-950 shadow-[0_32px_90px_rgba(7,13,30,0.45)] backdrop-blur-md"
    >
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[1.6rem] bg-[#0f172a] p-4 text-white">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/18 text-sm font-semibold text-white">
                AK
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">An Khuong</p>
                <p className="truncate text-xs text-white/55">
                  launchly-studio@team
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Github className="h-4 w-4 text-cyan-300" />
              Connected workspace
            </div>
            <h3 className="mt-3 text-lg font-semibold">Launchly App</h3>
            <p className="mt-1 text-sm text-white/60">
              Repo, docs, screenshots, product story
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {tabs.map((tab) => (
              <SidebarButton
                key={tab.id}
                active={tab.id === activeTab}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0 rounded-[1.6rem] bg-[#f4f7fb] p-4 sm:p-5">
          <div className="rounded-[1.5rem] border border-zinc-900/8 bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {panelCopy.badge}
                </p>
                <h2 className="mt-2 font-display text-4xl leading-tight text-zinc-950">
                  {panelCopy.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
                  {panelCopy.description}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-4 w-4" />
                Launchly Studio
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "workspace" ? <WorkspacePanel /> : null}
              {activeTab === "video" ? (
                <VideoPanel
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />
              ) : null}
              {activeTab === "edit" ? <EditPanel /> : null}
              {activeTab === "image" ? <ImagePanel /> : null}
              {activeTab === "library" ? <LibraryPanel /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
