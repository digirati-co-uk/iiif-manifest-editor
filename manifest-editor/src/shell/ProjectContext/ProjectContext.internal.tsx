import {
  ProjectBackend,
  ProjectContext,
  useApps,
  useProjectActionsWithBackend,
  useProjectBackend,
  useProjectLoader,
} from "@/shell";
import { ReactNode, useEffect, useMemo, useReducer } from "react";
import { FileSystemFolderBackend } from "@/shell/ProjectContext/backend/FileSystemFolderBackend";
import { LocalStorageBackend } from "@/shell/ProjectContext/backend/LocalStorageBackend";
import { FileSystemLoader } from "@/shell/ProjectContext/storage/FileSystemLoader";
import { LocalStorageLoader } from "@/shell/ProjectContext/storage/LocalStorageLoader";
import { getDefaultProjectContextState, projectContextReducer } from "@/shell/ProjectContext/ProjectContext.reducer";
import { CollectionContext, ManifestContext, VaultProvider } from "react-iiif-vault";
import { AbstractVaultLoader } from "@/shell/ProjectContext/storage/AbstractVaultLoader";
import { ProjectReactContext } from "./ProjectContext";

export interface ProjectProviderProps {
  children: ReactNode;
  defaultApp?: string;
  // Storage
  storage?: AbstractVaultLoader<any>;
  backend?: ProjectBackend;
}
export function ProjectProvider(props: ProjectProviderProps) {
  const { currentApp, changeApp, apps } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  // @todo this may be configuration or something else.
  //   The interface for the loader will definitely change over time.
  const backend = useMemo(
    () => props.backend || (window.__TAURI__ ? new FileSystemFolderBackend() : new LocalStorageBackend()),
    []
  );
  const storage = useMemo(
    () => props.storage || (window.__TAURI__ ? new FileSystemLoader() : new LocalStorageLoader()),
    []
  );
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
