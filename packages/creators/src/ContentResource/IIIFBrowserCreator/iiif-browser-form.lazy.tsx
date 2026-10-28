import { LocalizedIIIFBrowser } from "@manifest-editor/components";
import { useEditorI18n, useTranslations, type MessageReference } from "@manifest-editor/i18n";
import { useConfig, useNotebookBrowserPlugins } from "@manifest-editor/shell";
import type { CreatorContext } from "@manifest-editor/creator-api";
import { PreviewVaultBoundary, usePreviewVault } from "@manifest-editor/shell";
import type { IIIFBrowserProps } from "iiif-browser";
import { useMemo } from "react";
import { formatIIIFBrowserOutput } from "./iiif-browser-output";

export interface IIIFBrowserCreatorInitialData {
  /** Optional UI message; legacy caller labels remain literal fallbacks. */
  actionLabelMessage?: MessageReference;
  url?: string;
  iiifBrowserOptions?: Partial<IIIFBrowserProps>;
}

export default function IIIFBrowserCreatorForm(props: CreatorContext) {
  const t = useTranslations("creators");
  const { resolveMessage } = useEditorI18n();
  const notebookPlugins = useNotebookBrowserPlugins();
  const initialData: IIIFBrowserCreatorInitialData = useMemo(() => {
    return props.options.initialData || {};
  }, [props.options.initialData]);

  const vault = usePreviewVault();
  const {
    runCreate,
    options: { targetType },
  } = props;
  const notebookConfig = useConfig().notebook;
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        // Output descriptors live for the browser lifetime. Keep labels reactive without remounting.
        get label() {
          const fallback =
            targetType === "Canvas"
              ? (notebookConfig?.canvasActionLabel ?? t("browser.addToManifest"))
              : t("browser.select");
          return resolveMessage(
            initialData.actionLabelMessage ||
              (targetType === "Canvas" ? notebookConfig?.canvasActionLabelMessage : undefined),
            fallback
          );
        },
        supportedTypes: ["Canvas", "CanvasList", "CanvasRegion", "ImageService", "ImageServiceRegion"],
        cb: (resource) => runCreate({ output: resource }),
        format: {
          type: "custom",
          format: formatIIIFBrowserOutput,
        },
      },
    ] as IIIFBrowserProps["output"];
  }, [
    runCreate,
    targetType,
    notebookConfig?.canvasActionLabel,
    notebookConfig?.canvasActionLabelMessage,
    t,
    initialData.actionLabelMessage,
    resolveMessage,
  ]);

  const navigationOptions = useMemo(() => {
    return {
      canCropImage: true,
      canSelectCanvas: true,
      canSelectManifest: false,
      canSelectCollection: false,
      // @todo fix the output so this one works.
      multiSelect: true,
      ...(initialData.iiifBrowserOptions?.navigation || {}),
    } as IIIFBrowserProps["navigation"];
  }, [initialData]);

  const uiOptions = useMemo(() => {
    return {
      buttonClassName: "bg-me-primary-500 text-white hover:bg-me-primary-600",
      homeLink:
        initialData.url ||
        (typeof props.config?.defaultCollection === "string" ? props.config.defaultCollection : undefined),
      ...(initialData.iiifBrowserOptions?.ui || {}),
    } as IIIFBrowserProps["ui"];
  }, [initialData, props.config]);
  const historyOptions = useMemo(() => {
    const history = initialData.iiifBrowserOptions?.history || {};
    if (!initialData.url || history.initialHistory?.length) return history;
    return {
      ...history,
      restoreFromLocalStorage: false,
      saveToLocalStorage: false,
      initialHistory: [
        {
          url: initialData.url,
          resource: null,
          route: initialData.url.startsWith("iiif://")
            ? initialData.url.replace("iiif://", "/")
            : `/loading?id=${encodeURIComponent(initialData.url)}`,
        },
      ],
    } as IIIFBrowserProps["history"];
  }, [initialData]);

  return (
    <PreviewVaultBoundary>
      <LocalizedIIIFBrowser
        plugins={[...notebookPlugins, ...(initialData.iiifBrowserOptions?.plugins || [])]}
        ui={uiOptions}
        vault={vault}
        className="iiif-browser border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
        output={output}
        navigation={navigationOptions}
        customPages={initialData.iiifBrowserOptions?.customPages || {}}
        history={historyOptions}
      />
    </PreviewVaultBoundary>
  );
}
