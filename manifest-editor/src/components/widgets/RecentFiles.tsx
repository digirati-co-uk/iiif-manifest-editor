import { IIIFBuilder } from "iiif-builder";
import { ManifestNormalized } from "@iiif/presentation-3";
import { ThumbnailImg } from "../../atoms/Thumbnail";
import { RecentLabel, RecentManifestCard, RecentThumbnails } from "../../atoms/RecentFilesWidget";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { useProjectContext } from "../../shell/ProjectContext/ProjectContext";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { useShell } from "../../context/ShellContext/ShellContext";

type RecentFiles = {
  recentManifests: ManifestNormalized[] | undefined;
  changeManifest: (id: string) => void;
};

export const RecentFiles: React.FC<RecentFiles> = ({ recentManifests, changeManifest }) => {
  const { changeSelectedApplication } = useShell();
  const { allProjects, actions } = useProjectContext();

  function switchProject(id: string) {
    actions.switchProject(id);
    changeSelectedApplication("ManifestEditor");
  }

  return (
    <>
      <h4>Recently opened </h4>
      <RecentThumbnails>
        {allProjects.map((project) => {
          return (
            <RecentManifestCard>
              <ErrorBoundary>
                {project.thumbnail ? (
                  <ThumbnailImg src={project.thumbnail} loading="lazy" onClick={() => switchProject(project.id)} />
                ) : null}
              </ErrorBoundary>
              <RecentLabel onClick={() => switchProject(project.id)}>{project.name}</RecentLabel>
            </RecentManifestCard>
          );
        })}
      </RecentThumbnails>
    </>
  );
};
