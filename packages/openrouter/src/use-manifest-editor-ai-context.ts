import { useEffect, useMemo, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useInStack } from "@manifest-editor/editors";
import {
  useApp,
  useAppResource,
  useEditingResource,
  useEditingResourceStack,
  useLayoutState,
  usePreviewContext,
} from "@manifest-editor/shell";
import { buildManifestEditorAiContextSummary, buildManifestEditorSystemPrompt } from "./ai-context";
import { detectManifestEditorMode } from "./utils";
import type { ManifestEditorAiContextSummary } from "./types";

export function useManifestEditorAiContext(): ManifestEditorAiContextSummary {
  const app = useApp();
  const rootResource = useAppResource();
  const vault = useVault();
  const currentSelection = useEditingResource();
  const stack = useEditingResourceStack();
  const activeCanvas = useInStack("Canvas");
  const activeRange = useInStack("Range");
  const layout = useLayoutState();
  const previewContext = usePreviewContext();
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const mode = useMemo(() => {
    return detectManifestEditorMode({
      rootResource,
      creators: app.layout.creators || [],
    });
  }, [app.layout.creators, rootResource]);

  useEffect(() => {
    let cancelled = false;

    previewContext.actions
      .getPreviewLink()
      .then((link) => {
        if (!cancelled) {
          setPreviewLink(link);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewLink(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [previewContext.actions, rootResource.id]);

  return useMemo(() => {
    const rootEntity = vault.get(rootResource as any, { skipSelfReturn: false } as any);
    const currentEntity = currentSelection?.resource?.source
      ? vault.get(currentSelection.resource.source as any, { skipSelfReturn: false } as any)
      : null;
    const stackEntities = stack
      .map((item) => vault.get(item.resource.source as any, { skipSelfReturn: false } as any))
      .filter(Boolean);
    const activeCanvasEntity = activeCanvas?.resource?.source
      ? vault.get(activeCanvas.resource.source as any, { skipSelfReturn: false } as any)
      : null;
    const activeRangeEntity = activeRange?.resource?.source
      ? vault.get(activeRange.resource.source as any, { skipSelfReturn: false } as any)
      : null;

    const summary = buildManifestEditorAiContextSummary({
      mode,
      vault,
      rootEntity,
      currentEntity,
      stackEntities,
      activeCanvasEntity,
      activeRangeEntity,
      layout: {
        leftPanelId: layout.leftPanel.current,
        centerPanelId: layout.centerPanel.current,
        rightPanelId: layout.rightPanel.current,
        rightPanelTab: layout.rightPanel.state?.currentTab || null,
      },
      previewLink,
    });

    const systemPrompt = buildManifestEditorSystemPrompt(summary);

    return {
      ...summary,
      systemPrompt,
    };
  }, [
    activeCanvas?.resource?.source,
    activeRange?.resource?.source,
    currentSelection?.resource?.source,
    layout.centerPanel.current,
    layout.leftPanel.current,
    layout.rightPanel.current,
    layout.rightPanel.state,
    mode,
    previewLink,
    rootResource,
    stack,
    vault,
  ]);
}
