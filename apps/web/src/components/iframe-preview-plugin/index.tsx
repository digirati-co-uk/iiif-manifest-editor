import { Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import {
  type BackgroundPanel,
  type LayoutPanel,
  type PluginMetadata,
  useAppResource,
  useLayoutActions,
} from "@manifest-editor/shell";
import { type SVGProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleString, useManifest, useVault } from "react-iiif-vault";
import {
  IFRAME_PREVIEW_CENTER_PANEL_ID,
  IFRAME_PREVIEW_CONNECT,
  IFRAME_PREVIEW_LEFT_PANEL_ID,
  IFRAME_PREVIEW_PLUGIN_ID,
  IFRAME_PREVIEW_READY,
  IFRAME_PREVIEW_SELECTION,
  THESEUS_IFRAME_PREVIEW_URL,
} from "./constants";
import { createIframeVaultBridge } from "./vault-message-bridge";
import { openIframePreviewWindow, updateIframePreviewWindow } from "./window-preview-manager";

export default {
  id: IFRAME_PREVIEW_PLUGIN_ID,
  label: "Iframe preview",
  description: "Preview the current manifest in an iframe backed by vault communication.",
  author: "Digirati",
  official: true,
  defaultEnabled: false,
  tags: ["preview", "iframe", "vault"],
  supports: {
    apps: ["manifest-editor"],
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const leftPanels: LayoutPanel[] = [
  {
    id: IFRAME_PREVIEW_LEFT_PANEL_ID,
    label: "Iframe preview",
    icon: <PreviewIcon />,
    render: () => <IframePreviewSidebar />,
  },
];

export const centerPanels: LayoutPanel[] = [
  {
    id: IFRAME_PREVIEW_CENTER_PANEL_ID,
    label: "Iframe preview",
    icon: <PreviewIcon />,
    options: {
      hideHeader: true,
    },
    render: () => <IframePreviewMain />,
  },
];

export const background: BackgroundPanel[] = [
  {
    id: "iframe-preview-window-background",
    label: "Iframe preview window background",
    render: () => <IframePreviewWindowBackground />,
  },
];

function IframePreviewSidebar() {
  const actions = useLayoutActions();
  const rootResource = useAppResource();
  const manifest = useManifest();
  const vault = useVault();
  const canvas = useInStack("Canvas");
  const currentCanvasId = canvas?.resource.source.id || manifest?.items?.[0]?.id || null;
  const currentCanvas = currentCanvasId ? vault.get(currentCanvasId) : null;

  return (
    <Sidebar>
      <SidebarHeader title="Iframe preview" />
      <SidebarContent className="flex min-h-0 flex-col gap-3 p-3">
        <div className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700">
          <div className="font-medium text-gray-900">Current canvas</div>
          <div className="mt-1 truncate text-gray-600">
            {currentCanvas ? <LocaleString>{currentCanvas.label}</LocaleString> : "No canvas selected"}
          </div>
        </div>
        <button
          type="button"
          className="rounded bg-me-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-me-primary-600"
          onClick={() => actions.open(IFRAME_PREVIEW_CENTER_PANEL_ID)}
        >
          Open preview
        </button>
        <button
          type="button"
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() =>
            openIframePreviewWindow({
              vault: vault as any,
              resource: rootResource,
              canvasId: currentCanvasId,
            })
          }
        >
          Open in new window
        </button>
      </SidebarContent>
    </Sidebar>
  );
}

function IframePreviewWindowBackground() {
  const vault = useVault();
  const rootResource = useAppResource();
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const currentCanvasId = canvas?.resource.source.id || manifest?.items?.[0]?.id || null;

  useEffect(() => {
    updateIframePreviewWindow({
      vault: vault as any,
      resource: rootResource,
      canvasId: currentCanvasId,
    });
  }, [vault, rootResource.id, rootResource.type, currentCanvasId]);

  return null;
}

function IframePreviewMain() {
  const vault = useVault();
  const rootResource = useAppResource();
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const resourceRef = useRef(rootResource);
  const canvasIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"waiting" | "connected" | "error">("waiting");
  const currentCanvasId = canvas?.resource.source.id || manifest?.items?.[0]?.id || null;
  const src = useMemo(() => createTheseusPreviewUrl(), []);
  const targetOrigin = useMemo(() => new URL(src).origin, [src]);

  resourceRef.current = rootResource;
  canvasIdRef.current = currentCanvasId;

  const connectPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    cleanupRef.current?.();
    setStatus("waiting");

    const channel = new MessageChannel();
    cleanupRef.current = createIframeVaultBridge(vault as any, channel.port1);

    try {
      iframe.contentWindow.postMessage(
        {
          _type: IFRAME_PREVIEW_CONNECT,
          resource: resourceRef.current,
          canvasId: canvasIdRef.current,
        },
        targetOrigin,
        [channel.port2],
      );
      setStatus("connected");
    } catch {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setStatus("error");
    }
  }, [targetOrigin, vault]);

  useEffect(() => {
    function handleReady(event: MessageEvent) {
      if (event.origin !== targetOrigin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?._type !== IFRAME_PREVIEW_READY) return;
      connectPreview();
    }

    window.addEventListener("message", handleReady);
    return () => {
      window.removeEventListener("message", handleReady);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [connectPreview, targetOrigin]);

  useEffect(() => {
    const target = iframeRef.current?.contentWindow;
    if (!target || status !== "connected") return;
    target.postMessage(
      {
        _type: IFRAME_PREVIEW_SELECTION,
        resource: rootResource,
        canvasId: currentCanvasId,
      },
      targetOrigin,
    );
  }, [status, rootResource.id, rootResource.type, currentCanvasId, targetOrigin]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-zinc-100">
      {status !== "connected" ? (
        <div className="border-b border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
          {status === "error" ? "Preview connection failed" : "Connecting preview..."}
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={src}
        title="IIIF iframe preview"
        className="min-h-0 flex-1 border-0 bg-white"
        onLoad={() => {
          setStatus("waiting");
        }}
      />
    </div>
  );
}

function createTheseusPreviewUrl() {
  const url = new URL(THESEUS_IFRAME_PREVIEW_URL);
  url.searchParams.set("manifest-editor-preview-origin", window.location.origin);
  return url.toString();
}

function PreviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2 0v13c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5Zm2 2h10v2H7v-2Zm0 4h4v5H7v-5Zm6 0h4v2h-4v-2Zm0 3h4v2h-4v-2Z"
      />
    </svg>
  );
}
