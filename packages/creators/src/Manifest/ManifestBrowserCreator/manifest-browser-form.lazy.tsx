import { LocalizedIIIFBrowser } from "@manifest-editor/components";
import { useEditorI18n, useTranslations, type MessageReference } from "@manifest-editor/i18n";
import { useNotebookBrowserPlugins } from "@manifest-editor/shell";
import type { CreatorContext } from "@manifest-editor/creator-api";
import { PreviewVaultBoundary, usePreviewVault } from "@manifest-editor/shell";
import type { IIIFBrowserProps } from "iiif-browser";
import { useMemo, useRef } from "react";

export interface ManifestBrowserCreatorInitialData {
  /** Optional UI message; legacy caller labels remain literal fallbacks. */
  actionLabelMessage?: MessageReference;
  url?: string;
  iiifBrowserOptions?: Partial<IIIFBrowserProps>;
}

export default function ManifestBrowserCreatorForm(props: CreatorContext) {
  const t = useTranslations("creators");
  const { resolveMessage } = useEditorI18n();
  const notebookPlugins = useNotebookBrowserPlugins();
  const vault = usePreviewVault();
  const initialData: ManifestBrowserCreatorInitialData = useMemo(() => {
    return props.options.initialData || {};
  }, [props.options.initialData]);

  const { runCreate } = props;
  const live = useRef({ t, resolveMessage, reference: initialData.actionLabelMessage, runCreate });
  live.current = { t, resolveMessage, reference: initialData.actionLabelMessage, runCreate };
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        // Retained by the browser store: resolve at display time, without replacing the store.
        get label() {
          const { t, resolveMessage, reference } = live.current;
          return resolveMessage(reference, t("browser.select"));
        },
        supportedTypes: ["Manifest", "Collection", "ManifestList", "CollectionList", "CollectionItemList"],
        cb: (resource) => live.current.runCreate({ output: resource }),
        format: {
          type: "custom",
          format: (resource, parent, vault) => {
            const resourcesAsArray = Array.isArray(resource) ? resource : [{ ...resource, parent }];
            const resources = [];
            for (const resource of resourcesAsArray) {
              resources.push({
                resource: vault.get(resource),
                parent: resource.parent,
                selector: resource.selector,
              });
            }
            return resources;
          },
        },
      },
    ] as IIIFBrowserProps["output"];
  }, [live]);

  const navigationOptions = useMemo(() => {
    return {
      canCropImage: false,
      canSelectCanvas: false,
      canSelectManifest: true,
      canSelectCollection: true,
      multiSelect: true,
      ...(initialData.iiifBrowserOptions?.navigation || {}),
    };
  }, [initialData.iiifBrowserOptions?.navigation]);

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
    if (!initialData.url) return history;
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
