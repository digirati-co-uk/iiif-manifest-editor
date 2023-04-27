import { FeaturedCard } from "@/apps/Splash/components/FeaturedCard/FeaturedCard";
import { FlexContainer } from "@/components/layout/FlexContainer";
import { useProjectContext } from "@/shell/ProjectContext/ProjectContext";
import { useApps } from "@/shell/AppContext/AppContext";

export function MyProjects() {
  const { allProjects, loadingStatus, actions } = useProjectContext();
  const { editProject } = useApps();

  if (loadingStatus && loadingStatus.loading) {
    return <div>Loading...</div>;
  }

  return (
    <FlexContainer>
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
    </FlexContainer>
  );
}
