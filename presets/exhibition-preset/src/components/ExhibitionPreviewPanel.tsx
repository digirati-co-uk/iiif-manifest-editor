import { useInStack } from "@manifest-editor/editors";
import {
  createIframeVaultBridge,
  useAppResource,
} from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
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
const MOBILE_VIEWPORT_WIDTH = 1024;
const MOBILE_PREVIEW_WIDTH = 440;
const SCALED_PREVIEW_SIZE = 0.5;

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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const resourceRef = useRef(rootResource);
  const canvasIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"waiting" | "connected" | "error">(
    "waiting",
  );
  const [viewportWidth, setViewportWidth] = useState(0);
  const [useScaledPreview, setUseScaledPreview] = useState(false);
  const [useMobileWidthPreview, setUseMobileWidthPreview] = useState(false);
  const currentCanvasId = focusSelectedCanvas
    ? canvas?.resource.source.id || manifest?.items?.[0]?.id || null
    : null;
  const src = useMemo(
    () => createScrollingPreviewUrl(preset, presetOptions).toString(),
    [preset, presetOptions],
  );
  const targetOrigin = useMemo(() => new URL(src).origin, [src]);
  const previewScale = useScaledPreview ? SCALED_PREVIEW_SIZE : 1;
  const iframeViewportWidth = useMobileWidthPreview
    ? MOBILE_PREVIEW_WIDTH
    : viewportWidth
      ? Math.round(viewportWidth / previewScale)
      : 0;
  const isMobileViewport =
    iframeViewportWidth > 0 && iframeViewportWidth <= MOBILE_VIEWPORT_WIDTH;

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
  }, [
    status,
    rootResource.id,
    rootResource.type,
    currentCanvasId,
    targetOrigin,
  ]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => {
      setViewportWidth(viewport.getBoundingClientRect().width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!viewportWidth) return;

    if (viewportWidth > MOBILE_VIEWPORT_WIDTH) {
      setUseScaledPreview(false);
      return;
    }

    setUseMobileWidthPreview(false);
  }, [viewportWidth]);

  const setScaledPreview = useCallback((nextValue: boolean) => {
    setUseScaledPreview(nextValue);
    if (nextValue) {
      setUseMobileWidthPreview(false);
    }
  }, []);

  const setMobileWidthPreview = useCallback((nextValue: boolean) => {
    setUseMobileWidthPreview(nextValue);
    if (nextValue) {
      setUseScaledPreview(false);
    }
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950">
      {status !== "connected" ? (
        <div className="border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          {status === "error"
            ? "Preview connection failed."
            : "Connecting to local exhibition viewer..."}
        </div>
      ) : null}
      <PreviewViewportNotice
        iframeViewportWidth={iframeViewportWidth}
        isMobileViewport={isMobileViewport}
        showScaleOption={
          viewportWidth > 0 && viewportWidth <= MOBILE_VIEWPORT_WIDTH
        }
        showMobileWidthOption={viewportWidth > MOBILE_VIEWPORT_WIDTH}
        useScaledPreview={useScaledPreview}
        useMobileWidthPreview={useMobileWidthPreview}
        onUseScaledPreviewChange={setScaledPreview}
        onUseMobileWidthPreviewChange={setMobileWidthPreview}
      />
      <div
        ref={viewportRef}
        className={twMerge(
          "flex min-h-0 flex-1 overflow-hidden bg-white",
          useScaledPreview ? "justify-start" : "justify-center",
        )}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title="Exhibition preview"
          className={twMerge(
            "block h-full shrink-0 border-0 bg-white",
            useMobileWidthPreview ? "shadow-2xl shadow-black/40" : "",
          )}
          style={{
            width: useMobileWidthPreview
              ? MOBILE_PREVIEW_WIDTH
              : useScaledPreview
                ? `${100 / SCALED_PREVIEW_SIZE}%`
                : "100%",
            maxWidth: useMobileWidthPreview ? "100%" : undefined,
            height: useScaledPreview ? `${100 / SCALED_PREVIEW_SIZE}%` : "100%",
            transform: useScaledPreview
              ? `scale(${SCALED_PREVIEW_SIZE})`
              : undefined,
            transformOrigin: "top left",
          }}
          onLoad={() => setStatus("waiting")}
        />
      </div>
    </div>
  );
}

function PreviewViewportNotice({
  iframeViewportWidth,
  isMobileViewport,
  showScaleOption,
  showMobileWidthOption,
  useScaledPreview,
  useMobileWidthPreview,
  onUseScaledPreviewChange,
  onUseMobileWidthPreviewChange,
}: {
  iframeViewportWidth: number;
  isMobileViewport: boolean;
  showScaleOption: boolean;
  showMobileWidthOption: boolean;
  useScaledPreview: boolean;
  useMobileWidthPreview: boolean;
  onUseScaledPreviewChange: (useScaledPreview: boolean) => void;
  onUseMobileWidthPreviewChange: (useMobileWidthPreview: boolean) => void;
}) {
  if (!iframeViewportWidth) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-900 px-3 py-2 text-xs text-zinc-200">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={twMerge(
            "shrink-0 rounded-full px-2 py-1 font-semibold ring-1 ring-inset",
            isMobileViewport
              ? "bg-amber-300/90 text-amber-950 ring-amber-200/50"
              : "bg-emerald-300/90 text-emerald-950 ring-emerald-200/50",
          )}
        >
          {isMobileViewport ? "Mobile view" : "Desktop view"}
        </span>
        <span className="truncate text-zinc-400">
          Iframe viewport: {iframeViewportWidth}px. Mobile starts at{" "}
          {MOBILE_VIEWPORT_WIDTH}px and below.
        </span>
      </div>

      {showScaleOption ? (
        <PreviewToggle
          label="50% scale"
          checked={useScaledPreview}
          onChange={onUseScaledPreviewChange}
        />
      ) : null}

      {showMobileWidthOption ? (
        <PreviewToggle
          label="Mobile width"
          checked={useMobileWidthPreview}
          onChange={onUseMobileWidthPreviewChange}
        />
      ) : null}
    </div>
  );
}

function PreviewToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/70 px-2.5 py-1.5 font-semibold text-zinc-200 shadow-sm shadow-black/20 transition-colors hover:border-zinc-700 hover:bg-zinc-950">
      <span>{label}</span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span className="relative h-5 w-9 rounded-full bg-zinc-700/80 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-zinc-100 after:shadow after:shadow-black/20 after:transition-transform peer-checked:bg-me-primary-500 peer-checked:after:translate-x-4" />
    </label>
  );
}
