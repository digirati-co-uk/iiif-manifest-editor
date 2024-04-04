import { ThumbnailImg } from "@/atoms/Thumbnail";
import { RecentLabel, RecentManifestCard, RecentThumbnails } from "@/atoms/RecentFilesWidget";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { useProjectContext } from "@/shell";
import { useApps } from "@/shell";
import { SecondaryButton } from "@/atoms/Button";
import { EditorProject } from "@/shell/ProjectContext/ProjectContext.types";

export const RecentFiles: React.FC = () => {
  const { editProject } = useApps();
  const { allProjects, actions } = useProjectContext();

  function switchProject(project: EditorProject) {
    actions.switchProject(project.id);
    editProject(project);
  }

  return (
    <>
      <h4>Recently opened </h4>
      <RecentThumbnails>
        {allProjects.map((project) => {
          return (
            <RecentManifestCard style={{ cursor: "pointer" }}>
              <ErrorBoundary>
                {project.thumbnail ? (
                  <ThumbnailImg src={project.thumbnail} loading="lazy" onClick={() => switchProject(project)} />
                ) : (
                  <SecondaryButton
                    style={{ backgroundColor: "white", borderRadius: "5px", padding: "0.5rem" }}
                    onClick={() => switchProject(project)}
                  >
                    {project.name}
                  </SecondaryButton>
                )}
              </ErrorBoundary>
            </RecentManifestCard>
          );
        })}
      </RecentThumbnails>
    </>
  );
};
