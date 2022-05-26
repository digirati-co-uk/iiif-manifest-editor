import { ThumbnailImg } from "../../atoms/Thumbnail";
import { RecentLabel, RecentManifestCard, RecentThumbnails } from "../../atoms/RecentFilesWidget";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { useProjectContext } from "../../shell/ProjectContext/ProjectContext";
import { useApps } from "../../shell/AppContext/AppContext";

export const RecentFiles: React.FC = () => {
  const { changeApp } = useApps();
  const { allProjects, actions } = useProjectContext();

  function switchProject(id: string) {
    actions.switchProject(id);
    changeApp({ id: "manifest-editor" });
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
