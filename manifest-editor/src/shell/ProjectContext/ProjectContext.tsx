import { createContext, ReactNode, useContext, useMemo, useReducer } from "react";
import { EditorProject, ProjectContext } from "./ProjectContext.types";
import { useProjectActionsWithBackend, useProjectBackend, useProjectLoader } from "./ProjectContext.hooks";
import { getDefaultProjectContextState, projectContextReducer } from "./ProjectContext.reducer";
import invariant from "tiny-invariant";
import { ManifestContext, VaultProvider } from "react-iiif-vault";
import { LocalStorageLoader } from "./storage/LocalStorageLoader";
import { LocalStorageBackend } from "./backend/LocalStorageBackend";
import { ExternalManifestUrlPreview } from "../PreviewContext/previews/ExternalManifestUrlPreview";

const ProjectReactContext = createContext<ProjectContext | null>(null);

export function ProjectProvider(props: { children: ReactNode }) {
  // @todo this may be configuration or something else.
  //   The interface for the loader will definitely change over time.
  const backend = useMemo(() => new LocalStorageBackend(), []);
  const storage = useMemo(() => new LocalStorageLoader(), []);

  const [state, dispatch] = useReducer(projectContextReducer, undefined, getDefaultProjectContextState);
  const actions = useProjectActionsWithBackend(dispatch, backend);
  const context: ProjectContext = useMemo(() => ({ actions, ...state }), [actions, state]);
  const { vault, ready } = useProjectLoader(context, storage);
  const manifest = context.current?.resource;

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
      <ManifestContext manifest={manifest.id}>
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

function usePreview(project: EditorProject) {
  const urls = [
    {
      id: "universal-viewer",
      type: "external-manifest-preview",
      label: "Universal Viewer",
      config: {
        url: "http://universalviewer.io/examples/#?manifest=",
      },
    },
  ];

  // So this is mapped to:
  const urls2 = [
    new ExternalManifestUrlPreview({
      id: "universal-viewer",
      type: "external-manifest-preview",
      label: "Universal Viewer",
      config: {
        url: "http://universalviewer.io/examples/#?manifest=",
      },
    }),
  ];

  async function createPreview(loader: ExternalManifestUrlPreview) {
    // 1st, check if the loader is already activated on the resource.
    // project.previews.find(p => p.id === loader.id);

    const ctx = {};
    const dependencies = [];
    for (const requirement of loader.getRequires()) {
      // get dependencies recursive, and infinite loop protect...
    }

    // Build up ctx to be passed in to creator.
    // Activate the dependencies
    // And finally the Main one.
  }

  async function updatePreview(project: EditorProject) {
    const ctx = {};

    for (const preview of project.previews) {
      // Build up context from here.
      // id -> external class, get dependencies -> load.
    }
  }

  createPreview(urls2[0]);

  // 1. List available previews, likely driven by configuration.
  // 2. Get "isActive" status for showing
  // 3. Clicking to "go to" preview
}
