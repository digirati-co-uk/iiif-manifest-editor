import { ReactNode, useEffect, useMemo, useReducer } from "react";
import { ProjectReactContext, ProjectLoadingReactContext } from "./ProjectContext";
import { useApps, AppResourceProvider, AppResourceInstanceProvider } from "@manifest-editor/shell";
import { useProjectActionsWithBackend, useProjectLoader, useProjectBackend } from "./ProjectContext.hooks";
import { projectContextReducer, getDefaultProjectContextState } from "./ProjectContext.reducer";
import { ProjectBackend, ProjectState, ProjectContext } from "./ProjectContext.types";
import { LocalStorageBackend } from "./backend/LocalStorageBackend";
import { AbstractVaultLoader } from "./storage/AbstractVaultLoader";
import { LocalStorageLoader } from "./storage/LocalStorageLoader";
import { VaultProvider } from "react-iiif-vault";

export interface ProjectProviderProps {
  children: ReactNode;
  defaultApp?: string;
  // Storage
  storage?: AbstractVaultLoader<any>;
  backend?: ProjectBackend;
  initialState?: () => ProjectState;
}

export function ProjectProvider(props: ProjectProviderProps) {
  const { currentApp, changeApp } = useApps();
  // @todo this may be configuration or something else.
  //   The interface for the loader will definitely change over time.
  const backend = useMemo(() => props.backend || new LocalStorageBackend(), []);
  const storage = useMemo(() => props.storage || new LocalStorageLoader(), []);
  const [state, dispatch] = useReducer(
    projectContextReducer,
    undefined,
    props.initialState || getDefaultProjectContextState
  );
  const actions = useProjectActionsWithBackend(dispatch, backend, storage);
  const context: ProjectContext = useMemo(
    () => ({ actions, canDelete: backend.canDelete(), ...state }),
    [actions, backend, state]
  );
  const { vault, ready, error } = useProjectLoader(context, storage);
  const manifestOrCollection = context.current?.resource;

  const loadingStatus = useMemo(() => {
    return { isLoading: !ready, isError: !!error, error };
  }, [ready, error]);

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

  return (
    <ProjectLoadingReactContext.Provider value={loadingStatus}>
      <ProjectReactContext.Provider value={context}>
        <VaultProvider vault={vault || undefined} key={state.current?.id}>
          <AppResourceInstanceProvider id={context.current?.id}>
            <AppResourceProvider resource={manifestOrCollection}>{props.children}</AppResourceProvider>
          </AppResourceInstanceProvider>
        </VaultProvider>
      </ProjectReactContext.Provider>
    </ProjectLoadingReactContext.Provider>
  );
}
