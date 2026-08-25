import type { Vault } from "@iiif/helpers/vault";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { createIframeVaultBridge } from "../PreviewVault/vault-message-bridge";

const PREVIEW_CONNECT = "manifest-editor:iframe-preview:connect";
const PREVIEW_READY = "manifest-editor:iframe-preview:ready";
const PREVIEW_SELECTION = "manifest-editor:iframe-preview:selection";

export type PreviewWindowOptions = {
  url: string;
  resource: { id: string; type: string };
  canvasId?: string | null;
  annotationId?: string | null;
  name?: string;
  features?: string;
  reloadKey?: string;
};

type PreviewWindowContextValue = {
  open: (options: PreviewWindowOptions) => void;
  update: (options: PreviewWindowOptions) => void;
  focus: () => void;
  isClosed: boolean;
};

const PreviewWindowReactContext = createContext<PreviewWindowContextValue | null>(null);

export function PreviewWindowProvider({ children }: { children: ReactNode }) {
  const vault = useVault();
  const previewWindow = useRef<Window | null>(null);
  const options = useRef<PreviewWindowOptions | null>(null);
  const cleanupBridge = useRef<(() => void) | null>(null);
  const connected = useRef(false);
  const [isClosed, setIsClosed] = useState(true);

  const connect = useCallback(() => {
    if (!previewWindow.current || previewWindow.current.closed || !options.current) return;

    cleanupBridge.current?.();
    const channel = new MessageChannel();
    cleanupBridge.current = createIframeVaultBridge(vault as Vault, channel.port1);
    previewWindow.current.postMessage(
      {
        _type: PREVIEW_CONNECT,
        resource: options.current.resource,
        canvasId: options.current.canvasId || null,
        annotationId: options.current.annotationId || undefined,
      },
      new URL(options.current.url).origin,
      [channel.port2]
    );
    connected.current = true;
  }, [vault]);

  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (!options.current || event.source !== previewWindow.current) return;
      if (event.origin !== new URL(options.current.url).origin) return;
      if (event.data?._type === PREVIEW_READY) connect();
    };
    const checkClosed = window.setInterval(() => {
      if (previewWindow.current?.closed) {
        cleanupBridge.current?.();
        cleanupBridge.current = null;
        connected.current = false;
        previewWindow.current = null;
        setIsClosed(true);
      }
    }, 1000);

    window.addEventListener("message", handleReady);
    return () => {
      window.removeEventListener("message", handleReady);
      window.clearInterval(checkClosed);
      cleanupBridge.current?.();
    };
  }, [connect]);

  const open = useCallback((nextOptions: PreviewWindowOptions) => {
    options.current = nextOptions;
    const current = previewWindow.current;

    if (current && !current.closed) {
      current.focus();
      return;
    }

    cleanupBridge.current?.();
    cleanupBridge.current = null;
    connected.current = false;
    previewWindow.current = window.open(
      nextOptions.url,
      nextOptions.name || "manifest-editor-preview",
      nextOptions.features || "popup,width=1200,height=900"
    );
    setIsClosed(!previewWindow.current);
  }, []);

  const update = useCallback((nextOptions: PreviewWindowOptions) => {
    const previous = options.current;
    options.current = nextOptions;
    const current = previewWindow.current;
    if (!current || current.closed) return;

    if (previous && (previous.url !== nextOptions.url || previous.reloadKey !== nextOptions.reloadKey)) {
      cleanupBridge.current?.();
      cleanupBridge.current = null;
      connected.current = false;
      current.location.href = nextOptions.url;
      return;
    }

    if (connected.current) {
      current.postMessage(
        {
          _type: PREVIEW_SELECTION,
          resource: nextOptions.resource,
          canvasId: nextOptions.canvasId || null,
          annotationId: nextOptions.annotationId || undefined,
        },
        new URL(nextOptions.url).origin
      );
    }
  }, []);

  const focus = useCallback(() => {
    if (previewWindow.current && !previewWindow.current.closed) previewWindow.current.focus();
  }, []);

  return (
    <PreviewWindowReactContext.Provider value={{ open, update, focus, isClosed }}>
      {children}
    </PreviewWindowReactContext.Provider>
  );
}

export function usePreviewWindow() {
  const context = useContext(PreviewWindowReactContext);
  invariant(context, "usePreviewWindow() can only be called from inside <PreviewWindowProvider />");
  return context;
}
