import { toRef } from "@iiif/parser/presentation-4";
import type { Vault4 } from "@iiif/helpers/vault-4";
import type { ManifestNormalized } from "@iiif/parser/presentation-4-normalized/types";
import type { AppExtension, MappedApp, PresetTemplateDefinition } from "./AppContext/AppContext";
import { mergeBackgroundActionDefinitions } from "./BackgroundTasks/BackgroundTasksStore";
import { mergePartialConfig } from "./ConfigContext/ConfigContext";

export type PresentationVersion = 2 | 3 | 4;

export function getExportVersion(
  vault: Vault4,
  resource: { id: string; type: string },
  requestedVersion: PresentationVersion = 3
): PresentationVersion {
  if (requestedVersion === 2 || requestedVersion === 4) return requestedVersion;

  const root = vault.get(resource as any) as { items?: Array<{ type?: string }> } | undefined;
  if (root?.items?.some((item) => item.type === "Scene")) return 4;

  try {
    vault.toPresentation3(resource as any);
    return 3;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Presentation 4 -> 3 downgrade unsupported:")) return 4;
    throw error;
  }
}

export function serializeResource(
  vault: Vault4,
  resource: { id: string; type: string },
  requestedVersion: PresentationVersion = 3
) {
  switch (getExportVersion(vault, resource, requestedVersion)) {
    case 2:
      return vault.toPresentation2(resource as any);
    case 4:
      return vault.toPresentation4(resource as any);
    default:
      return vault.toPresentation3(resource as any);
  }
}

export async function getManifestNomalized(id: string): Promise<ManifestNormalized | undefined> {
  let responseData: ManifestNormalized | undefined;
  try {
    await fetch(id)
      .then((response) => {
        return response.json().catch((err) => {
          console.error(`'${err}' happened!`);
        });
      })
      .then((data) => {
        responseData = { ...data };
      });
  } catch (error) {
    console.log(error);
  }
  return responseData;
}

export function createActionIdentity(type: string, property: string, parent: any) {
  return `create_${type}_${property}_${toRef(parent)?.type || "unknown"}`;
}

export function createDownload(data: any, fileName: string, fileType = "text/json") {
  // Create a blob with the data we want to download as a file
  const blob = data instanceof Blob ? data : new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
}

export async function copyToClipboard(json: string | any) {
  return navigator.clipboard.writeText(typeof json === "string" ? json : JSON.stringify(json, null, 2));
}

export function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}

export function mapApp(input: any, map?: (app: MappedApp) => MappedApp): MappedApp {
  const { default: metadata, config, preset, ...props } = input;
  const app = {
    metadata: metadata as any,
    layout: {
      leftPanels: [],
      rightPanels: [],
      centerPanels: [],
      ...(props as any),
    },
    config,
    preset,
  };

  const mapped = map ? map(app) : app;
  return { ...mapped, preset: mergePresetConfig(undefined, mapped.preset) };
}

export function mergePresetConfig(
  base: MappedApp["preset"] | undefined,
  override: MappedApp["preset"] | undefined
): MappedApp["preset"] | undefined {
  if (!base && !override) return undefined;

  const templateFilter =
    base?.templateFilter && override?.templateFilter
      ? (template: PresetTemplateDefinition) => base.templateFilter!(template) && override.templateFilter!(template)
      : override?.templateFilter || base?.templateFilter;
  const templates =
    override?.templateStrategy === "replace"
      ? override.templates || []
      : [...(base?.templates || []), ...(override?.templates || [])];
  const preview =
    base?.preview || override?.preview
      ? {
          ...(base?.preview || {}),
          ...(override?.preview || {}),
          actions: [...(base?.preview?.actions || []), ...(override?.preview?.actions || [])],
        }
      : undefined;

  return {
    ...(base || {}),
    ...(override || {}),
    templateFilter,
    templates: templateFilter ? templates.filter(templateFilter) : templates,
    preview,
  };
}

export function extendApp(app: MappedApp, metadata: MappedApp["metadata"], extensions: AppExtension): MappedApp {
  return {
    ...app,
    metadata,
    config: mergePartialConfig(app.config || {}, extensions.config || {}),
    preset: mergePresetConfig(app.preset, extensions.preset),
    layout: {
      ...app.layout,
      leftPanels: [
        ...(app.layout.leftPanels || []).filter((panel) => {
          if (extensions?.leftPanelIds) {
            return extensions.leftPanelIds.includes(panel.id);
          }
          return true;
        }),
        ...(extensions?.leftPanels || []),
      ],
      annotations: [...(extensions?.annotations || []), ...(app.layout.annotations || [])],
      canvasEditors: [...(extensions?.canvasEditors || []), ...(app.layout.canvasEditors || [])],
      creators: [...(extensions?.creators || []), ...(app.layout.creators || [])],
      background: [...(app.layout?.background || []), ...(extensions?.background || [])],
      backgroundActions: mergeBackgroundActionDefinitions(
        app.layout?.backgroundActions || [],
        extensions?.backgroundActions || []
      ),
      editors: [
        //
        ...(extensions?.editors || []),
        ...(app.layout.editors || []),
      ],
      rightPanels: [...(app.layout.rightPanels || []), ...(extensions?.rightPanels || [])],
      centerPanels: [...(app.layout.centerPanels || []), ...(extensions?.centerPanels || [])],
      modals: [...(app.layout.modals || []), ...(extensions?.modalPanels || [])],
    },
  };
}
