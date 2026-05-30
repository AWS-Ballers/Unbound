<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Launchly — agent context

**App:** `launchly/` — Next.js App Router, Auth.js, Prisma/Postgres, OpenAI (brief/chat), PixVerse (video/edit).

**Design direction:** Full shell redesign inspired by frontend-skills-from-code patterns — authenticated layout with **left sidebar** (user avatar + info on top), **main content**, **right panel** (contextual assistant or flow controls). Unauthenticated users only see login/logout until auth; then a simple dashboard and workspace shell.

## Product we are building

### Auth & shell

- Login/logout (GitHub OAuth / credentials) before any dashboard.
- After auth: dashboard listing workspaces; opening a workspace shows sidebar tabs + right panel.
- Sidebar top: signed-in user avatar and profile info.

### Workspaces (projects)

- Users create **workspaces** (implemented as `Project` in Prisma).
- Per workspace: upload **all source types** (file, text, website, GitHub).
- **GitHub connector** indexes the whole repo for context.
- **Workspace tab** (`/projects/[id]/sources`): sources on the left, **source assistant chat** on the right to find more sources to add.

### Sidebar tabs (target UX)

| Tab | Route | Purpose |
|-----|-------|---------|
| Workspace | `.../sources` | Sources + grounded chat assistant |
| Images | `.../images` | Image generation from workspace context |
| Video | `.../generate` | Video generation referencing workspace; template picker with **images**; Skip (bottom-right) or Back (bottom-left) on right panel; outputs saved in workspace/library |
| Edit | `.../studio` | Upload or reference workspace videos for PixVerse edit; download when done; save to library |
| Library | `.../library` | All generated images and videos (including edits) |

### Video flow (right panel on Video tab)

1. Reference current workspace context.
2. Show **templates with pictures** to choose from (or Skip / Back).
3. Generate video; on completion persist clip and surface under workspace/library.

### Edit flow (Edit tab)

- Upload video or pick existing workspace clip.
- PixVerse modify/extend/transition.
- Download button when ready; asset appears in Library tab.

### Chat assistant conventions

- On **Workspace** tab, right panel is `ChatPanel` (source assistant).
- Users can **reference workspaces or files with `/`** in chat: type `/` to open a picker (workspaces, sources, clips, images). Selected items are sent as structured `references` on `POST /api/chat` and narrowed into the model context.
- Token format in the textarea after pick: `/Label` (tracked server-side by id + kind).

## Current implementation status (May 2026)

| Area | Status |
|------|--------|
| Auth + `AuthenticatedShell` (sidebar, avatar, workspaces list) | Done |
| Dashboard + workspace CRUD | Done |
| Workspace sources (file/GitHub/website/text) | Done |
| Source assistant chat | Done |
| `/` references in chat | Done (picker + API + server context) |
| Images / Video / Edit / Library tabs | Scaffolded; generation + PixVerse wired |
| Template images + Skip/Back on video panel | Partial (`VideoRightPanel`, `template-selector`) |
| Full visual redesign to match frontend-skills spec | In progress (other tab) |

Related docs: `.trae/documents/launchly-prd.md`, `.trae/documents/launchly-technical-architecture.md`.

## Parallel workstreams (delegate to subagents)

When splitting work, use **explore** or **generalPurpose** subagents in parallel on separate branches or files. Do not duplicate shell/layout work across agents.

| Stream | Owner focus | Key paths |
|--------|-------------|-----------|
| **A — Shell & auth UX** | Login gate, dashboard, sidebar avatar, workspace switcher, responsive layout | `src/components/shell/*`, `src/app/dashboard`, `src/app/auth` |
| **B — Workspace sources** | Upload UX, GitHub connector (`GitHubConnector`, inspect/connect APIs), source list | `src/app/projects/[projectId]/sources`, `src/app/api/github/*`, `src/lib/github.ts` |
| **C — Chat & `/` references** | Picker UX, reference API, grounded answers | `src/components/workspace/chat-panel.tsx`, `src/app/api/chat`, `src/server/chat.ts` |
| **D — Video + templates** | Template gallery with images, Skip/Back, job polling, save to library | `src/app/projects/[projectId]/generate`, `video-right-panel.tsx`, `src/lib/templates.ts` |
| **E — Images** | Generation UI, library handoff | `src/app/projects/[projectId]/images`, `src/app/api/generate/image` |
| **F — Edit (PixVerse)** | Studio upload, workspace clip picker, download | `src/app/projects/[projectId]/studio`, `src/lib/pixverse.ts` |
| **G — Library** | Unified grid for images + videos + edits | `src/app/projects/[projectId]/library` |

**Integration rule:** Stream A owns layout contracts; B–G plug into `WorkspaceRightPanel` and sidebar tabs without forking the shell.

## Commands

```bash
cd launchly
npm install
npx prisma migrate dev
npm run dev
```

Production uses Postgres when `DATABASE_URL` is set and `DEMO_MODE=false` (default). Demo/mock data only runs when there is no database or `DEMO_MODE=true`.

## Code conventions

- Workspaces = `Project` model; UI copy may say "workspace".
- Server actions and route handlers use Zod schemas in `src/lib/contracts.ts`.
- Prefer extending existing components over new parallel shells.
