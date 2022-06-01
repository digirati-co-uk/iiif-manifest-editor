import { ThumbnailImg } from "../../atoms/Thumbnail";
import { RecentLabel, RecentManifestCard, RecentThumbnails } from "../../atoms/RecentFilesWidget";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { useProjectContext } from "../../shell/ProjectContext/ProjectContext";
import { useApps } from "../../shell/AppContext/AppContext";
import { TemplateCardPlaceholder } from "../../atoms/TemplateCard";
import { SecondaryButton } from "../../atoms/Button";

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
            <RecentManifestCard style={{ cursor: "pointer" }}>
              <ErrorBoundary>
                {project.thumbnail ? (
                  <ThumbnailImg src={project.thumbnail} loading="lazy" onClick={() => switchProject(project.id)} />
                ) : (
                  <SecondaryButton
                    style={{ backgroundColor: "white", borderRadius: "5px", padding: "0.5rem" }}
                    onClick={() => switchProject(project.id)}
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
