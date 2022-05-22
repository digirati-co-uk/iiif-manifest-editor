import { createContext, ReactNode, useContext, useMemo, useReducer } from "react";
import { ProjectContext } from "./ProjectContext.types";
import { useProjectActionsWithBackend, useProjectBackend, useProjectLoader } from "./ProjectContext.hooks";
import { getDefaultProjectContextState, projectContextReducer } from "./ProjectContext.reducer";
import invariant from "tiny-invariant";
import { ManifestContext, VaultProvider } from "react-iiif-vault";
import { LocalStorageLoader } from "./storage/LocalStorageLoader";
import { LocalStorageBackend } from "./backend/LocalStorageBackend";

const ProjectReactContext = createContext<ProjectContext | null>(null);

export function ProjectProvider(props: { children: ReactNode }) {
  // @todo this may be configuration or something else.
  //   The interface for the loader will definitely change over time.
  const backend = useMemo(() => new LocalStorageBackend(), []);
  const storage = useMemo(() => new LocalStorageLoader(), []);

  const [state, dispatch] = useReducer(projectContextReducer, undefined, getDefaultProjectContextState);
  const actions = useProjectActionsWithBackend(dispatch, backend);
  const context: ProjectContext = useMemo(() => ({ actions, ...state }), [actions, state]);
  const { manifest, vault, ready } = useProjectLoader(context, storage);

  useProjectBackend(context, backend);

  if (state.loadingStatus && state.loadingStatus.loading) {
    return <div>Loading...</div>;
  }

  if (!vault || !manifest || !ready) {
    return (
      <VaultProvider>
        <ProjectReactContext.Provider value={context}>{props.children}</ProjectReactContext.Provider>
      </VaultProvider>
    );
  }

  return (
    <VaultProvider vault={vault} key={state.current?.id}>
      <ManifestContext manifest={manifest}>
        <ProjectReactContext.Provider value={context}>{props.children}</ProjectReactContext.Provider>
      </ManifestContext>
    </VaultProvider>
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
