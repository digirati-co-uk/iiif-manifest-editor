import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from "react";
import { ProjectContext } from "./ProjectContext.types";
import { useProjectActionsWithBackend, useProjectBackend, useProjectLoader } from "./ProjectContext.hooks";
import { getDefaultProjectContextState, projectContextReducer } from "./ProjectContext.reducer";
import invariant from "tiny-invariant";
import { ManifestContext, VaultProvider } from "react-iiif-vault";
import { LocalStorageLoader } from "./storage/LocalStorageLoader";
import { LocalStorageBackend } from "./backend/LocalStorageBackend";
import { Loading } from "../../atoms/Loading";
import { useShell } from "../../context/ShellContext/ShellContext";

const ProjectReactContext = createContext<ProjectContext | null>(null);

export function ProjectProvider(props: { children: ReactNode }) {
  // @todo this may be configuration or something else.
  //   The interface for the loader will definitely change over time.
  const backend = useMemo(() => new LocalStorageBackend(), []);
  const storage = useMemo(() => new LocalStorageLoader(), []);
  const shell = useShell();
  const [state, dispatch] = useReducer(projectContextReducer, undefined, getDefaultProjectContextState);
  const actions = useProjectActionsWithBackend(dispatch, backend);
  const context: ProjectContext = useMemo(() => ({ actions, ...state }), [actions, state]);
  const { vault, ready } = useProjectLoader(context, storage);
  const manifest = context.current?.resource;

  useProjectBackend(context, backend);

  useEffect(() => {
    if (
      state.loadingStatus &&
      state.loadingStatus.loaded &&
      ready &&
      (!vault || !manifest) &&
      shell.selectedApplication !== "Splash"
    ) {
      console.log("Changed to splash?");
      shell.changeSelectedApplication("Splash");
    }
  }, []);

  if (state.loadingStatus && state.loadingStatus.loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProjectReactContext.Provider value={context}>
      <VaultProvider vault={vault || undefined} key={state.current?.id}>
        <ManifestContext manifest={manifest?.id || ""}>{props.children}</ManifestContext>
      </VaultProvider>
    </ProjectReactContext.Provider>
  );
}

export function useProjectContext() {
  const ctx = useContext(ProjectReactContext);

  invariant(ctx, "useProjectContext can only be called from inside <ProjectProvider />");

  return ctx;
}

export function useCurrentProject() {
  const current = useProjectContext().current;

  invariant(current, "No current project");

  return current;
}
