import { createContext, useContext } from "react";
import { EditorProject, ProjectContext } from "./ProjectContext.types";
import invariant from "tiny-invariant";

export const ProjectReactContext = createContext<ProjectContext | null>(null);

export function useProjectContext(): ProjectContext {
  const ctx = useContext(ProjectReactContext);

  invariant(ctx, "useProjectContext can only be called from inside <ProjectProvider />");

  return ctx;
}

export function useCurrentProject(): EditorProject {
  const current = useProjectContext().current;

  invariant(current, "No current project");

  return current;
}
