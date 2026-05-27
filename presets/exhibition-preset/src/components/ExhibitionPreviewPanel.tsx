import { useInStack } from "@manifest-editor/editors";
import { createIframeVaultBridge, useAppResource } from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import {
  createScrollingPreviewUrl,
  type PresetUrlSearchParamsOptions,
  type PresetUrlSearchParamsPreset,
} from "../helpers/exhibition-preview-url-helper";

export interface ExhibitionPreviewPanelProps {
  preset: PresetUrlSearchParamsPreset;
  presetOptions?: Partial<PresetUrlSearchParamsOptions>;
  focusSelectedCanvas?: boolean;
}

const PREVIEW_CONNECT = "manifest-editor:iframe-preview:connect";
const PREVIEW_READY = "manifest-editor:iframe-preview:ready";
const PREVIEW_SELECTION = "manifest-editor:iframe-preview:selection";

export function ExhibitionPreviewPanel({
  preset,
  presetOptions,
  focusSelectedCanvas = true,
}: ExhibitionPreviewPanelProps) {
  const vault = useVault();
  const rootResource = useAppResource();
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const resourceRef = useRef(rootResource);
  const canvasIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"waiting" | "connected" | "error">("waiting");
  const currentCanvasId = focusSelectedCanvas
    ? canvas?.resource.source.id || manifest?.items?.[0]?.id || null
    : null;
  const src = useMemo(() => createScrollingPreviewUrl(preset, presetOptions).toString(), [preset, presetOptions]);
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
          _type: PREVIEW_CONNECT,
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
      if (event.data?._type !== PREVIEW_READY) return;
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
        _type: PREVIEW_SELECTION,
        resource: rootResource,
        canvasId: currentCanvasId,
      },
      targetOrigin,
    );
  }, [status, rootResource.id, rootResource.type, currentCanvasId, targetOrigin]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950">
      {status !== "connected" ? (
        <div className="border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          {status === "error" ? "Preview connection failed." : "Connecting to local exhibition viewer..."}
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={src}
        title="Scrolling exhibition preview"
        className="min-h-0 flex-1 border-0 bg-white"
        onLoad={() => setStatus("waiting")}
      />
    </div>
  );
}
