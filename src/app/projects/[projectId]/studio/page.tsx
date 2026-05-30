import { PageHeader } from "@/components/ui/page-header";
import { StudioEditor } from "@/components/workspace/studio-editor";
import { getViewer } from "@/lib/auth";
import { getProjectWorkspace } from "@/server/projects";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const viewer = await getViewer();
  const { projectId } = await params;
  const workspace = await getProjectWorkspace(projectId, viewer.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Edit"
        title="Edit videos with PixVerse"
        description="Pick a video from this workspace, then run modify, extend, or transition. Finished edits save to the Library."
      />

      <StudioEditor
        projectId={projectId}
        clips={workspace.clips.map((clip) => ({
          id: clip.id,
          label: clip.label,
          outputUrl: clip.outputUrl,
          thumbnailUrl: clip.thumbnailUrl,
          tag: clip.tag,
          version: clip.version,
          durationSeconds: clip.durationSeconds,
        }))}
      />
    </div>
  );
}
