import { useProjectContext } from "../../../../shell/ProjectContext/ProjectContext";
import { projectFromManifest } from "../../../../shell/ProjectContext/helpers/project-from-manifest";
import { getManifestNomalized } from "../../../../helpers/getManifestNormalized";
import { useApps } from "@/shell/AppContext/AppContext";

export function ProjectListing() {
  const { allProjects, current, loadingStatus, actions, canDelete } = useProjectContext();
  const { changeApp } = useApps();

  if (loadingStatus && loadingStatus.loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Project listing 2</h1>
      {allProjects.map((project) => {
        return (
          <li key={project.id}>
            {project.name} ({project.id})
            <button
              disabled={current?.id === project.id}
              onClick={() => {
                actions.switchProject(project.id);
              }}
            >
              select
            </button>
            <button disabled={!canDelete} onClick={() => actions.deleteProject(project.id)}>
              delete
            </button>
          </li>
        );
      })}
      <button
        onClick={() => {
          getManifestNomalized("https://digirati-co-uk.github.io/wunder.json").then((manifest) => {
            if (manifest) {
              const created = projectFromManifest(manifest as any);
              actions.createProject(created);
            }
          });
        }}
      >
        Create new project
      </button>
    </>
  );
}
