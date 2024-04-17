import { createContext, useContext } from "react";
import { EditorProject, ProjectContext } from "./ProjectContext.types";
import invariant from "tiny-invariant";

export const ProjectReactContext = createContext<ProjectContext | null>(null);
export const ProjectLoadingReactContext = createContext<{ isLoading: boolean; isError: boolean; error?: string }>({
  error: undefined,
  isError: false,
  isLoading: false,
});

export function useProjectLoading() {
  return useContext(ProjectLoadingReactContext);
}

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

export function useOptionalCurrentProject(): EditorProject | null {
  const current = useProjectContext().current;

  return current || null;
}
