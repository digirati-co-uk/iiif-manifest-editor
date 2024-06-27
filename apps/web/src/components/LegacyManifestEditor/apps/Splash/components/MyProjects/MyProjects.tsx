import { useApps } from "@manifest-editor/shell";
import { FeaturedCard } from "../FeaturedCard/FeaturedCard";
import { useProjectContext } from "@manifest-editor/projects";

export function MyProjects() {
  const { allProjects, loadingStatus, actions } = useProjectContext();
  const { changeApp } = useApps();
  const editProject = (project: any) => {
    if (project.resource.type === "Manifest") {
      changeApp({ id: "manifest-editor" });
    }
    if (project.resource.type === "Collection") {
      changeApp({ id: "collection-editor" });
    }
  };

  if (loadingStatus && loadingStatus.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      {allProjects.map((project) => {
        return (
          <FeaturedCard
            key={project.id}
            label={project.name}
            onClick={() => {
              actions.switchProject(project.id);
              editProject(project);
            }}
            thumbnail={<img src={project.thumbnail} alt="" />}
            actionLabel="Open project"
          />
        );
      })}
    </div>
  );
}
