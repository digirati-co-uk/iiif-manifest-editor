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

export function useProjectActionsWithBackend(dispatch: Dispatch<ProjectActionsType>, backend: ProjectBackend) {
  function createProject(payload: EditorProject) {
    dispatch({ type: "createProject", payload });
    backend.createProject(payload).then(() => {
      // @todo notification?
      console.log("Loader: project created");
      switchProject(payload.id);
    });
  }
  function deleteProject(payload: string) {
    dispatch({ type: "deleteProject", payload });
    backend.deleteProject(payload).then(() => {
      // @todo notification?
      console.log("Loader: project deleted");
    });
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
    dispatch({ type: "saveProject", payload: project });

    backend.updateProject(project).then(() => {
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
  const saveChanges = useCallback(() => {
    if (currentRef.current) {
      const newStorage = storage.getLatestStorage(currentRef.current);
      if (!shallowEqual(newStorage, currentRef.current.storage)) {
        // @todo Ideally this would be actions.updateStorage()
        //   but currently the actions don't map fully to the
        //   loader. The loader is only updated when saveProject()
        //   is explicity called.
        actions.saveProject({
          ...currentRef.current,
          storage: newStorage,
        });
      }
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
      promise.then(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [promise]);

  // This will ensure that the changes are saved before reloading or navigating away.
  useEffect(() => {
    window.addEventListener("beforeunload", saveChanges, false);
    return () => {
      window.removeEventListener("beforeunload", saveChanges);
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
  };
}
