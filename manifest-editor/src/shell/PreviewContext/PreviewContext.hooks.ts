import { Dispatch, useMemo } from "react";
import {
  PreviewActions,
  PreviewActionsType,
  PreviewConfiguration,
  PreviewHandler,
  PreviewState,
} from "./PreviewContext.types";
import { ExternalManifestUrlPreview } from "./previews/ExternalManifestUrlPreview";
import { IIIFPreviewService } from "./previews/IIIFPreviewService";
import { useProjectContext } from "../ProjectContext/ProjectContext";
import invariant from "tiny-invariant";
import { useVault } from "react-iiif-vault";

export function usePreviewActions(
  state: PreviewState,
  dispatch: Dispatch<PreviewActionsType>,
  handlers: PreviewHandler[]
): PreviewActions {
  const vault = useVault();
  const projects = useProjectContext();
  const currentProject = projects.current;

  const [handlerMap, providesMap] = useMemo(() => {
    const map: Record<string, PreviewHandler> = {};
    const providesMap: Record<string, string> = {};
    for (const handler of handlers) {
      map[handler.id] = handler;
      const provides = handler.getProvides();
      if (provides.length) {
        for (const singleProvides of provides) {
          if (!providesMap[singleProvides]) {
            providesMap[singleProvides] = handler.id;
          }
        }
      }
    }
    return [map, providesMap] as const;
  }, [handlers]);

  async function updatePreviews() {
    const selected = state.selected;
    const previews = currentProject?.previews;
    const selectedPreview = previews?.find((p) => p.id === selected);
    if (currentProject && previews && previews.length && selectedPreview) {
      const selectedHandler = handlerMap[selectedPreview.id];
      const requires = selectedHandler.getRequires();

      // Build context.
      const context: any = {};
      for (const preview of previews) {
        const fullPreview = handlerMap[preview.id];
        if (fullPreview) {
          const provides = fullPreview.getProvides();
          for (const provide of provides) {
            if (requires.indexOf(provide) !== -1) {
              const newPreview = await fullPreview.updatePreview(currentProject, vault, context);
              if (newPreview) {
                dispatch({ type: "activatePreview", payload: newPreview.id });
                Object.assign(context, newPreview.data || {});
              }
            }
          }
        }
      }

      // Select
      const handler = handlerMap[selectedPreview.id];
      if (handler) {
        const newPreview = await handler.updatePreview(currentProject, vault, context);
        if (newPreview) {
          projects.actions.setPreview(newPreview);
        } else {
          projects.actions.removePreview(selectedPreview.id);
          await handler.deletePreview(currentProject.id);
        }
      }
    }
  }

  async function selectPreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (selectedHandler && currentProject) {
      await activatePreview(id);

      dispatch({ type: "selectPreview", payload: id });
    }
  }

  function deletePreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (selectedHandler && currentProject) {
      projects.actions.removePreview(id);
      selectedHandler.deletePreview(currentProject.id).then(() => {
        dispatch({ type: "deletePreview", payload: id });
      });
    }
  }

  async function focusPreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (handlerMap[id] && currentProject) {
      await selectedHandler.focus(currentProject);
      dispatch({ type: "focusPreview", payload: id });
    }
  }

  async function activatePreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (selectedHandler && currentProject) {
      const existingPreviewList = currentProject.previews;
      const existingPreview = existingPreviewList.find((p) => p.id === id);
      if (!existingPreview || !selectedHandler.isPreviewValid(currentProject)) {
        const context: any = {};
        const requires = selectedHandler.getRequires();
        // @todo this could be recursive, but not doing that yet.
        for (const requirement of requires) {
          const handlerId = providesMap[requirement];
          const handler = handlerId ? handlerMap[handlerId] : null;
          invariant(handler, `Missing handler for Preview requirement "${requirement}"`);
          const existing = existingPreviewList.find((p) => p.id === handlerId);
          if (!existing || !handler.isPreviewValid(currentProject)) {
            const contextualPreview = await handler.createPreview(currentProject, vault, context);
            Object.assign(context, contextualPreview?.data || {});
            projects.actions.setPreview(contextualPreview);
            dispatch({ type: "activatePreview", payload: contextualPreview.id });
          } else {
            Object.assign(context, existing?.data || {});
            dispatch({ type: "activatePreview", payload: id });
          }
        }
        projects.actions.setPreview(await selectedHandler.createPreview(currentProject, vault, context));
        dispatch({ type: "activatePreview", payload: id });
      }
    }
  }

  return useMemo(
    () => ({ selectPreview, deletePreview, focusPreview, activatePreview, updatePreviews }),
    // Dispatch has a stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handlerMap, currentProject, vault, state.selected]
  );
}

export function usePreviewHandlers(configs: PreviewConfiguration[]): PreviewHandler[] {
  // @todo in the future the available classes could come from somewhere else and not hardcoded.
  return useMemo(() => {
    const handlers: PreviewHandler[] = [];

    for (const config of configs) {
      switch (config.type) {
        case "iiif-preview-service":
          handlers.push(new IIIFPreviewService(config));
          break;
        case "external-manifest-preview":
          handlers.push(new ExternalManifestUrlPreview(config));
          break;
      }
    }
    return handlers;

    // @todo if these ever become configurable, remove this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
