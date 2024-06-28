import { toRef } from "@iiif/parser";
import { ManifestNormalized } from "@iiif/presentation-3-normalized";
import { MappedApp } from "./AppContext/AppContext";

export async function getManifestNomalized(id: string): Promise<ManifestNormalized | undefined> {
  let responseData: ManifestNormalized | undefined = undefined;
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
  const { default: metadata, ...props } = input;
  const app = {
    metadata: metadata as any,
    layout: {
      leftPanels: [],
      rightPanels: [],
      centerPanels: [],
      ...(props as any),
    },
  };

  return map ? map(app) : app;
}
