import type { Vault } from "@iiif/helpers/vault";
import {
  IFRAME_PREVIEW_CONNECT,
  IFRAME_PREVIEW_READY,
  IFRAME_PREVIEW_SELECTION,
  THESEUS_IFRAME_PREVIEW_URL,
} from "./constants";
import { createIframeVaultBridge } from "./vault-message-bridge";

type PreviewWindowOptions = {
  vault: Vault;
  resource: { id: string; type: string };
  canvasId: string | null;
};

let previewWindow: Window | null = null;
let cleanupBridge: (() => void) | null = null;
let latestOptions: PreviewWindowOptions | null = null;
let readyListenerAttached = false;
let closeCheck: number | null = null;

export function openIframePreviewWindow(options: PreviewWindowOptions) {
  latestOptions = options;
  ensureReadyListener();
  const previewUrl = createTheseusPreviewUrl();

  if (!previewWindow || previewWindow.closed) {
    cleanupWindowBridge();
    previewWindow = window.open(
      previewUrl,
      "manifest-editor-iframe-preview",
      "popup,width=1200,height=900",
    );
  } else {
    previewWindow.focus();
    if (cleanupBridge) {
      sendPreviewWindowSelection(options);
    } else {
      previewWindow.location.href = previewUrl;
    }
  }

  if (closeCheck === null) {
    closeCheck = window.setInterval(() => {
      if (previewWindow?.closed) {
        cleanupWindowBridge();
        previewWindow = null;
      }
    }, 1000);
  }
}

export function updateIframePreviewWindow(options: PreviewWindowOptions) {
  latestOptions = options;
  if (!previewWindow || previewWindow.closed || !cleanupBridge) {
    return;
  }
  sendPreviewWindowSelection(options);
}

function ensureReadyListener() {
  if (readyListenerAttached) return;
  readyListenerAttached = true;
  window.addEventListener("message", handlePreviewWindowReady);
}

function handlePreviewWindowReady(event: MessageEvent) {
  const previewOrigin = getTheseusPreviewOrigin();
  if (event.origin !== previewOrigin) return;
  if (!previewWindow || event.source !== previewWindow) return;
  if (event.data?._type !== IFRAME_PREVIEW_READY) return;
  if (!latestOptions) return;
  connectPreviewWindow(latestOptions);
}

function connectPreviewWindow(options: PreviewWindowOptions) {
  if (!previewWindow || previewWindow.closed) return;

  cleanupWindowBridge();
  latestOptions = options;

  const channel = new MessageChannel();
  cleanupBridge = createIframeVaultBridge(options.vault, channel.port1);
  const previewOrigin = getTheseusPreviewOrigin();
  previewWindow.postMessage(
    {
      _type: IFRAME_PREVIEW_CONNECT,
      resource: options.resource,
      canvasId: options.canvasId,
    },
    previewOrigin,
    [channel.port2],
  );
}

function sendPreviewWindowSelection(options: PreviewWindowOptions) {
  const previewOrigin = getTheseusPreviewOrigin();
  previewWindow?.postMessage(
    {
      _type: IFRAME_PREVIEW_SELECTION,
      resource: options.resource,
      canvasId: options.canvasId,
    },
    previewOrigin,
  );
}

function cleanupWindowBridge() {
  cleanupBridge?.();
  cleanupBridge = null;
}

function createTheseusPreviewUrl() {
  const url = new URL(THESEUS_IFRAME_PREVIEW_URL);
  url.searchParams.set("manifest-editor-preview-origin", window.location.origin);
  return url.toString();
}

function getTheseusPreviewOrigin() {
  return new URL(THESEUS_IFRAME_PREVIEW_URL).origin;
}
