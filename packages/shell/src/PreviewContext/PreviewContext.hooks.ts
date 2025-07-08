import { type Dispatch, useMemo } from "react";
import { useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { useAppResource, useAppResourceInstance } from "../AppResourceProvider/AppResourceProvider";
import type {
  Preview,
  PreviewActions,
  PreviewActionsType,
  PreviewConfiguration,
  PreviewHandler,
  PreviewState,
} from "./PreviewContext.types";
import { ExternalManifestUrlPreview } from "./previews/ExternalManifestUrlPreview";
import { IIIFPreviewService } from "./previews/IIIFPreviewService";

export function usePreviewActions(
  state: PreviewState,
  dispatch: Dispatch<PreviewActionsType>,
  handlers: PreviewHandler[],
  previews: Preview[],
  setPreviews: (previews: Preview[] | ((prev: Preview[]) => Preview[])) => void,
): PreviewActions {
  const resource = useAppResource();
  const instanceId = useAppResourceInstance();
  const vault = useVault();

  const previewActions = useMemo(
    () => ({
      setPreview: (preview: Preview) => {
        if (!preview) return;
        setPreviews((prev) => [...prev.filter((item) => item.id !== preview.id), preview]);
      },
      removePreview: (id: string) => {
        setPreviews((prev) => prev.filter((p) => p.id !== id));
      },
    }),
    [setPreviews, instanceId],
  );
  //
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
    const selectedPreview = previews.find((p) => p.id === selected);
    if (previews && previews.length && selectedPreview) {
      const selectedHandler = handlerMap[selectedPreview.id]!;
      const requires = selectedHandler.getRequires();
      // Build context.
      const context: any = {};
      for (const preview of previews) {
        const fullPreview = handlerMap[preview.id];
        if (fullPreview) {
          const provides = fullPreview.getProvides();
          for (const provide of provides) {
            if (requires.indexOf(provide) !== -1) {
              const newPreview = await fullPreview.updatePreview(instanceId, resource, vault, context);
              if (newPreview) {
                previewActions.setPreview(newPreview);
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
        const newPreview = await handler.updatePreview(instanceId, resource, vault, context);
        if (newPreview) {
          previewActions.setPreview(newPreview);
        } else {
          previewActions.removePreview(selectedPreview.id);
          await handler.deletePreview(instanceId);
        }
      }
    }
  }

  async function selectPreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (selectedHandler && instanceId) {
      dispatch({ type: "selectPreview", payload: id });
      await activatePreview(id);
    }
  }

  // Be able to generate a preview link on demand from the iiif-preview-service, if available.
  async function getPreviewLink(): Promise<null | string> {
    const handlerId = providesMap["readOnlyManifest"];
    const previewService = handlerId ? handlerMap[handlerId] : null;

    if (previewService && instanceId) {
      const existing = previews.find((p) => p.type === "iiif-preview-service");
      if (!existing || !(await previewService.isPreviewValid(instanceId, existing))) {
        const preview = await previewService.createPreview(instanceId, resource, vault, {});
        if (preview) {
          return preview.data.readOnlyManifest;
        }
      }
    }
    return null;
  }

  function deletePreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (selectedHandler && instanceId) {
      previewActions.removePreview(id);
      selectedHandler.deletePreview(instanceId).then(() => {
        dispatch({ type: "deletePreview", payload: id });
      });
    }
  }

  async function focusPreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (handlerMap[id] && instanceId && selectedHandler) {
      await selectedHandler.focus(instanceId);
      dispatch({ type: "focusPreview", payload: id });
    }
  }

  async function activatePreview(id: string) {
    const selectedHandler = handlerMap[id];
    if (selectedHandler && instanceId) {
      const existingPreview = previews.find((p) => p.id === id);
      if (!existingPreview || !selectedHandler.isPreviewValid(instanceId, existingPreview)) {
        const context: any = {};
        const requires = selectedHandler.getRequires();
        // @todo this could be recursive, but not doing that yet.
        for (const requirement of requires) {
          const handlerId = providesMap[requirement];
          const handler = handlerId ? handlerMap[handlerId] : null;

          invariant(handler, `Missing handler for Preview requirement "${requirement}"`);
          const existing = previews.find((p) => p.id === handlerId);
          const existingIsActive = state.active.find((a) => a === handlerId);

          const alwaysCreate = true as boolean;

          if (alwaysCreate || !existing || !(await handler.isPreviewValid(instanceId, existing))) {
            const contextualPreview = await handler.createPreview(instanceId, resource, vault, context);
            Object.assign(context, contextualPreview?.data || {});
            previewActions.setPreview(contextualPreview);
            dispatch({
              type: "activatePreview",
              payload: contextualPreview.id,
            });
          } else {
            Object.assign(context, existing?.data || {});
            dispatch({ type: "activatePreview", payload: existing.id });
          }
        }
        const created = await selectedHandler.createPreview(instanceId, resource, vault, context);
        if (created) {
          previewActions.setPreview(created);
          dispatch({ type: "activatePreview", payload: created.id });
        }
      }
    }
  }

  return useMemo(
    () => ({
      selectPreview,
      deletePreview,
      focusPreview,
      activatePreview,
      updatePreviews,
      getPreviewLink,
    }),
    // Dispatch has a stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handlerMap, instanceId, vault, state.selected, state.active, previews],
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
