import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EditorProject,
  ProjectActionsType,
  ProjectBackend,
  ProjectContext,
  ProjectsLoadingStatus,
  ProjectState,
  ProjectStorage,
} from "./ProjectContext.types";
import { Publication } from "./types/Publication";
import { Storage } from "./types/Storage";
import shallowEqual from "shallowequal";
import { useDebounce } from "tiny-use-debounce";
import { Preview } from "./types/Preview";
import { getManifestNomalized } from "../../helpers/getManifestNormalized";
import { projectFromManifest } from "./helpers/project-from-manifest";
import { convertPresentation2 } from "@iiif/parser/presentation-2";
import { useProjectContext } from "./ProjectContext";
import { useApps } from "../AppContext/AppContext";
import { v4 } from "uuid";
import { ensureUniqueFilename } from "./helpers/ensure-unique-filename";
import { once } from "@tauri-apps/api/event";
import { projectFromCollection } from "@/shell/ProjectContext/helpers/project-from-collection";

export function useProjectActionsWithBackend(
  dispatch: Dispatch<ProjectActionsType>,
  backend: ProjectBackend,
  storage: ProjectStorage<any>
) {
  async function createProject(payload: EditorProject) {
    const allProjects = await backend.getAllProjects(true);

    const project = { ...payload }; // avoid readonly payload.

    ensureUniqueFilename(project, allProjects);

    if (!storage.canCreate()) {
      throw new Error("Cannot create project with this storage backend");
    }

    const backendStorage = await storage.create(project, project.storage.data);
    const createdProject = { ...project, storage: backendStorage };
    await backend.createProject(createdProject);

    dispatch({ type: "createProject", payload: createdProject });

    switchProject(project.id);
  }
  function deleteProject(payload: string) {
    if (backend.canDelete()) {
      dispatch({ type: "deleteProject", payload });

      backend.deleteProject(payload).then(() => {
        // @todo notification?
        console.log("Loader: project deleted");
      });
    }
  }
  function switchProject(payload: string) {
    dispatch({ type: "switchProject", payload });
    backend.setLastProject(payload).then(() => {
      // probably nothing.
    });
  }
  function deselectProject(payload: string) {
    dispatch({ type: "deselectProject", payload });
  }
  function forkProject(payload: { id: string; name: string; filename?: string }) {
    dispatch({ type: "forkProject", payload });
    throw new Error("Not implemented yet");
  }
  function setLoadingStatus(payload: ProjectsLoadingStatus) {
    dispatch({ type: "setLoadingStatus", payload });
  }
  function saveProject(project: EditorProject) {
    console.log("trying to save project...");
    dispatch({ type: "saveProject", payload: project });

    Promise.all([
      //
      backend.updateProject(project),
      storage.saveStorage(project.storage),
    ]).then(() => {
      // @todo notification?
      console.log("Loader: project saved");
    });
  }
  function updateDetails(payload: { name: string; filename?: string }) {
    dispatch({ type: "updateDetails", payload });
  }
  function createPublication(payload: Publication) {
    dispatch({ type: "createPublication", payload });
  }
  function updatePublication(payload: Publication) {
    dispatch({ type: "updatePublication", payload });
  }
  function removePublication(payload: string) {
    dispatch({ type: "removePublication", payload });
  }
  function updateSettings(payload: EditorProject["settings"]) {
    dispatch({ type: "updateSettings", payload });
  }
  function updateThumbnail(payload: string) {
    dispatch({ type: "updateThumbnail", payload });
  }
  function updateStorage(payload: Storage) {
    dispatch({ type: "updateStorage", payload });
  }
  function load(payload: ProjectState) {
    dispatch({ type: "load", payload });
  }

  function setPreview(publication: Preview) {
    dispatch({ type: "setPreview", payload: publication });
  }
  function removePreview(id: string) {
    dispatch({ type: "removePreview", payload: id });
  }

  return useMemo(
    () => ({
      createProject,
      deleteProject,
      switchProject,
      deselectProject,
      forkProject,
      saveProject,
      setLoadingStatus,
      load,
      updateDetails,
      createPublication,
      updatePublication,
      removePublication,
      updateSettings,
      updateThumbnail,
      updateStorage,
      setPreview,
      removePreview,
    }),
    // Dispatch always stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

export function useProjectBackend({ actions, current }: ProjectContext, backend: ProjectBackend) {
  useEffect(() => {
    actions.setLoadingStatus({ loading: true, lastLoaded: 0, loaded: false });
    backend.getAllProjects().then(async (allProjects) => {
      const lastId = await backend.getLastProject();
      const lastValid = allProjects.find((s) => s.id === lastId);

      actions.load({
        allProjects: allProjects,
        current: lastValid || null,
        loadingStatus: {
          loaded: true,
          loading: false,
          lastLoaded: Date.now(),
        },
      });
    });
    // this is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useProjectLoader<T extends Storage = any>(
  { actions, current }: ProjectContext,
  storage: ProjectStorage<T>
) {
  const currentRef = useRef<EditorProject | null>(null);
  const [ready, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const saveChanges = useCallback(() => {
    const project = currentRef.current;
    if (project) {
      storage.saveStorage(project.storage).then(() => {
        const newStorage = storage.getBackendStorage(project);
        if (!shallowEqual(newStorage, project.storage)) {
          actions.saveProject({
            ...project,
            storage: newStorage,
          });
        }
      });
    }
  }, [actions, storage]);
  const debounceSaveChanges = useDebounce(saveChanges, storage.saveInterval);
  const currentId = current?.id;

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // The loader is responsible for creating Vault instances.
  // In the future this Vault instance could be remote and "clever"
  // Offering collaboration or similar features.
  const { vault, promise } = useMemo(() => {
    if (current) {
      const [vault, promise] = storage.createVaultInstance(current);
      return {
        vault,
        promise,
      };
    }

    return { vault: null, promise: null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage, currentId]);

  // If the vault takes some time to load from an external source we might have
  // some time to wait. This will listen to the "Vault is ready" promise.
  useEffect(() => {
    setIsReady(false);
    let cancelled = false;
    if (promise) {
      promise
        .then(() => {
          if (!cancelled) {
            setIsReady(true);
          }
        })
        .catch((e) => {
          setError(e.message);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [promise]);

  // This will ensure that the changes are saved before reloading or navigating away.
  useEffect(() => {
    window.addEventListener("beforeunload", saveChanges, false);
    let tauriUnload: any = undefined;
    if (window.__TAURI__) {
      tauriUnload = once("tauri://close-requested", saveChanges);
    }
    return () => {
      window.removeEventListener("beforeunload", saveChanges);
      if (tauriUnload) {
        tauriUnload();
      }
    };
  }, [saveChanges]);

  // When we unmount, or "current" is about to change, then
  // we call save once more.
  useEffect(() => {
    return () => {
      saveChanges();
    };
  }, [saveChanges, currentId]);

  // If the loader does not handle its own synchronisation through the Vault it provides, it can
  // let the application know and update the local copy instead. This callback is debounced
  // to ensure we don't call it too often.
  useEffect(() => {
    // @todo migrate this into the storage class.
    if (vault && storage.shouldUpdateWithVault()) {
      return vault.subscribe(debounceSaveChanges, true);
    }
  }, [debounceSaveChanges, storage, vault]);

  return {
    vault,
    ready,
    error,
  };
}

export function useProjectCreators() {
  const { changeApp } = useApps();
  const { actions } = useProjectContext();

  const createBlankManifest = useCallback(function createBlankManifest() {
    actions.createProject(
      projectFromManifest({
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id: `https://example.org/${v4()}`,
        type: "Manifest",
        label: {
          en: ["Blank Manifest"],
        },
        items: [],
      })
    );

    changeApp({ id: "manifest-editor" });

    // Actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProjectFromManifestId = useCallback(
    async function createProjectFromManifestId(id: string) {
      let full = await getManifestNomalized(id);
      if (full) {
        if ((full as any)["@id"]) {
          full = convertPresentation2(full) as any;
        }
        if (full) {
          actions.createProject(projectFromManifest(full as any));
          changeApp({ id: "manifest-editor" });
        }
      }
    },
    // Actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const createProjectFromCollectionId = useCallback(
    async function createProjectFromCollectionId(id: string) {
      let full = await getManifestNomalized(id);
      if (full) {
        if ((full as any)["@id"]) {
          full = convertPresentation2(full) as any;
        }
        if (full) {
          actions.createProject(projectFromCollection(full as any));
          changeApp({ id: "collection-editor" });
        }
      }
    },
    // Actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const createProjectFromManifestJson = useCallback(
    async function createProjectFromManifestId(json: string) {
      let full = JSON.parse(json);
      if (full) {
        if ((full as any)["@id"]) {
          full = convertPresentation2(full) as any;
        }
        if (full) {
          actions.createProject(projectFromManifest(full as any));
          changeApp({ id: "manifest-editor" });
        }
      }
    },
    // Actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    createProjectFromManifestJson,
    createProjectFromManifestId,
    createProjectFromCollectionId,
    createBlankManifest,
  };
}
