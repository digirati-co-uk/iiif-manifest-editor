import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useReducer } from "react";
import { ProjectContext } from "./ProjectContext.types";
import { useProjectActionsWithBackend, useProjectBackend, useProjectLoader } from "./ProjectContext.hooks";
import { getDefaultProjectContextState, projectContextReducer } from "./ProjectContext.reducer";
import invariant from "tiny-invariant";
import { CollectionContext, ManifestContext, VaultProvider } from "react-iiif-vault";
import { LocalStorageLoader } from "./storage/LocalStorageLoader";
import { LocalStorageBackend } from "./backend/LocalStorageBackend";
import { useApps } from "../AppContext/AppContext";
import { FileSystemFolderBackend } from "./backend/FileSystemFolderBackend";
import { FileSystemLoader } from "./storage/FileSystemLoader";

const ProjectReactContext = createContext<ProjectContext | null>(null);

export function ProjectProvider(props: { children: ReactNode; defaultApp?: string }) {
  const { currentApp, changeApp, apps } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  // @todo this may be configuration or something else.
  //   The interface for the loader will definitely change over time.
  const backend = useMemo(() => (window.__TAURI__ ? new FileSystemFolderBackend() : new LocalStorageBackend()), []);
  const storage = useMemo(() => (window.__TAURI__ ? new FileSystemLoader() : new LocalStorageLoader()), []);
  const [state, dispatch] = useReducer(projectContextReducer, undefined, getDefaultProjectContextState);
  const actions = useProjectActionsWithBackend(dispatch, backend, storage);
  const context: ProjectContext = useMemo(
    () => ({ actions, canDelete: backend.canDelete(), ...state }),
    [actions, backend, state]
  );
  const { vault, ready } = useProjectLoader(context, storage);
  const manifestOrCollection = context.current?.resource;

  useProjectBackend(context, backend);

  useEffect(() => {
    if (
      state.loadingStatus &&
      state.loadingStatus.loaded &&
      ready &&
      (!vault || !manifestOrCollection) &&
      currentApp?.id !== (props.defaultApp || "splash")
    ) {
      changeApp({ id: props.defaultApp || "splash" });
    }
  }, []);

  if ((state.loadingStatus && state.loadingStatus.loading) || (context.current && !manifestOrCollection)) {
    return <div>Loading...</div>;
  }

  if (manifestOrCollection?.type === "Manifest") {
    return (
      <ProjectReactContext.Provider value={context}>
        <VaultProvider vault={vault || undefined} key={state.current?.id}>
          <ManifestContext manifest={manifestOrCollection?.id || ""}>{props.children}</ManifestContext>
        </VaultProvider>
      </ProjectReactContext.Provider>
    );
  }

  if (manifestOrCollection?.type === "Collection") {
    return (
      <ProjectReactContext.Provider value={context}>
        <VaultProvider vault={vault || undefined} key={state.current?.id}>
          <CollectionContext collection={manifestOrCollection?.id || ""}>{props.children}</CollectionContext>
        </VaultProvider>
      </ProjectReactContext.Provider>
    );
  }

  return (
    <ProjectReactContext.Provider value={context}>
      <VaultProvider vault={vault || undefined} key={state.current?.id}>
        {props.children}
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
