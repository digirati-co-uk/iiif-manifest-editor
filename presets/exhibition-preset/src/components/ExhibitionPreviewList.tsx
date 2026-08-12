import { LazyThumbnail } from "@manifest-editor/components";
import { getInternationalStringText, useInStack } from "@manifest-editor/editors";
import { useCreator, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { useId, useState } from "react";
import { CanvasContext, LocaleString, useCanvas, useManifest, useVaultSelector } from "react-iiif-vault/presentation-4";
import { twMerge } from "tailwind-merge";
import { getGridStats } from "../helpers";
import {
  getAnnotationTargetBox,
  getPaintingAnnotations,
  getTourStepAnnotations,
  getResolvedAnnotationBody,
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";
import { sanitizeSummaryHtml } from "../right-panels/summary-html";
import { SlideshowSlidePreview } from "./SlideshowSlidePreview";
import { splitTourStepHtml } from "./tour-step-html";

export type PreviewMode = "slideshow" | "scroll";

const scrollPreviewWidth = 332;
const slideshowPreviewHeight = 180;

export function ExhibitionPreviewList({ mode }: { mode: PreviewMode }) {
  const { open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const [, canvasActions] = useCreator({ id: technical.id.get(), type: "Manifest" }, "items", "Canvas");
  const items = structural.items.get();

  return (
    <ExhibitionPreviewListLayout>
      {items.map((item, index) => (
        <CanvasContext key={item.id} canvas={item.id}>
          <ExhibitionPreviewCard
            mode={mode}
            onClick={() => {
              open({ id: "current-canvas" });
              canvasActions.edit(item, index);
            }}
          />
        </CanvasContext>
      ))}
    </ExhibitionPreviewListLayout>
  );
}

export function ExhibitionPreviewListLayout({ children }: { children: React.ReactNode }) {
  const manifest = useManifest();
  const { edit } = useLayoutActions();

  return (
    <div className="flex flex-col gap-3 p-2">
      <button
        type="button"
        onClick={() =>
          manifest &&
          edit(manifest, undefined, {
            forceOpen: true,
            selectedTab: "@manifest-editor/descriptive-properties",
          })
        }
        className="w-full rounded border border-slate-200 bg-white p-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        <LocaleString>{manifest?.label}</LocaleString>
      </button>
      {children}
    </div>
  );
}

export function ExhibitionPreviewCard({ mode, onClick }: { mode: PreviewMode; onClick: () => void }) {
  const canvas = useCanvas();
  const manifest = useManifest();
  const currentCanvas = useInStack("Canvas");
  const selected = currentCanvas?.resource.source?.id === canvas?.id;
  const [showSteps, setShowSteps] = useState(false);
  const stepsId = useId();
  const isInfoBox = (canvas?.behavior || []).includes("info");
  const isScrollInfoBox = mode === "scroll" && isInfoBox;
  const isCoverCanvas = useVaultSelector(
    (_, vaultInstance) => Boolean(manifest?.items?.[0]?.id === canvas?.id && canvas && isImageCanvas(vaultInstance, canvas)),
    [manifest?.items?.[0]?.id, canvas?.id, canvas?.items?.[0]?.id],
  );
  const tourSteps = useVaultSelector(
    (_, vaultInstance) => (canvas ? getTourStepAnnotations(vaultInstance, canvas) : []),
    [canvas?.id, canvas?.annotations?.[0]?.id],
  );

  if (!canvas) return null;

  return (
    <article
      className={twMerge(
        "overflow-hidden rounded border bg-white shadow-sm",
        selected ? "border-me-primary-500 ring-2 ring-me-primary-100" : "border-slate-200",
      )}
    >
      <button type="button" className="block w-full text-left" onClick={onClick}>
        <div className="border-b border-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700">
          <LocaleString>{canvas.label}</LocaleString>
        </div>
        {isCoverCanvas && canvas.behavior?.includes("splash") ? (
          <ManifestSplashPreview height={mode === "slideshow" ? slideshowPreviewHeight : 180} />
        ) : mode === "slideshow" ? (
          isInfoBox ? (
            <InfoBoxPreview height={slideshowPreviewHeight} />
          ) : (
            <div style={{ height: slideshowPreviewHeight, backgroundColor: "#303030" }}>
              <SlideshowSlidePreview className="pointer-events-none h-full w-full" mode="preview" />
            </div>
          )
        ) : (
          <ScrollPreview />
        )}
      </button>
      {tourSteps.length && !isScrollInfoBox ? (
        <div className="border-t border-slate-100">
          <button
            type="button"
            aria-expanded={showSteps}
            aria-controls={stepsId}
            className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            onClick={(event) => {
              event.stopPropagation();
              setShowSteps((open) => !open);
            }}
          >
            <span>{showSteps ? "Hide steps" : "Show steps"}</span>
            <span>{tourSteps.length}</span>
          </button>
          {showSteps ? (
            <div id={stepsId} className="flex flex-col gap-2 border-t border-slate-100 p-2">
              {tourSteps.map((step: any, index: number) => (
                <TourStepPreview key={step.id || index} annotation={step} canvas={canvas} onClick={onClick} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ScrollPreview() {
  const canvas = useCanvas();
  const behavior = canvas?.behavior || [];
  const { isInfo } = getGridStats(behavior);

  if (!canvas) return null;

  const canvasWidth = Number(canvas.width) || 1920;
  const canvasHeight = Number(canvas.height) || 1080;
  const height = Math.max(80, Math.round((scrollPreviewWidth / canvasWidth) * canvasHeight));

  if (isInfo) {
    return <InfoBoxPreview />;
  }

  return (
    <div className="min-h-0" style={{ height, backgroundColor: "#303030" }}>
      <div className="relative h-full min-h-0 overflow-hidden" style={{ backgroundColor: "#303030" }}>
        <div className="absolute inset-0">
          <LazyThumbnail cover={behavior.includes("cover") || behavior.includes("image-cover")} fade={false} />
        </div>
      </div>
    </div>
  );
}

function ManifestSplashPreview({ height = 180 }: { height?: number }) {
  const manifest = useManifest();
  const canvas = useCanvas();
  const summary = getInternationalStringText(manifest?.summary, "");
  const requiredStatementLabel = getInternationalStringText(manifest?.requiredStatement?.label, "");
  const requiredStatementValue = getInternationalStringText(manifest?.requiredStatement?.value, "");
  const behavior = canvas?.behavior || [];
  const invert = behavior.includes("invert");
  const overlay = typeof (canvas as any)?.backgroundColor === "string" ? (canvas as any).backgroundColor : null;

  return (
    <div
      className={twMerge("relative overflow-hidden bg-black p-4", invert ? "text-white" : "text-black")}
      style={{ height }}
    >
      <div className="absolute inset-0">
        <LazyThumbnail cover fade={false} />
      </div>
      <div className="absolute inset-0 z-10 opacity-35" style={{ background: overlay || "transparent" }} />
      <div
        className={twMerge(
          "relative z-20 flex h-full flex-col justify-end p-3",
          overlay ? "" : invert ? "bg-black/25 backdrop-blur-sm" : "bg-white/25 backdrop-blur-sm",
        )}
      >
        <LocaleString className="block text-base font-semibold leading-tight">{manifest?.label}</LocaleString>
        {summary ? <div className="mt-2 line-clamp-3 text-xs leading-relaxed opacity-75">{summary}</div> : null}
        {requiredStatementValue ? (
          <div className="mt-3 border-t border-current/20 pt-2 text-[11px] leading-snug opacity-75">
            {requiredStatementLabel ? <div className="font-semibold opacity-85">{requiredStatementLabel}</div> : null}
            <div>{requiredStatementValue}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoBoxPreview({ height }: { height?: number }) {
  const canvas = useCanvas();
  const longSummary = useVaultSelector(
    (_, vaultInstance) => (canvas ? getFirstAnnotationBodyHtml(vaultInstance, canvas.annotations?.[0]) : ""),
    [canvas?.id, canvas?.annotations?.[0]?.id],
  );

  if (!canvas) return null;

  return (
    <div className="overflow-y-auto bg-white p-3 text-black" style={height ? { height } : undefined}>
      <LocaleString className="mb-2 block text-sm font-semibold uppercase leading-tight">{canvas.label}</LocaleString>
      <div
        className="prose prose-sm max-w-none text-xs leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: longSummary || getInternationalStringText(canvas.summary, ""),
        }}
      />
    </div>
  );
}

function isImageCanvas(vault: any, canvas: any) {
  if (!canvas || canvas.behavior?.includes("info")) return false;

  return getPaintingAnnotations(vault, canvas).some((annotation: any) => {
    const body = getResolvedAnnotationBody(vault, annotation);
    const source = body?.type === "SpecificResource" ? body.source : body;
    const services = Array.isArray(source?.service) ? source.service : source?.service ? [source.service] : [];
    return source?.type === "Image" || services.length > 0;
  });
}

function TourStepPreview({ annotation, canvas, onClick }: { annotation: any; canvas: any; onClick: () => void }) {
  const { edit } = useLayoutActions();
  const selectTourStep = useSlideshowContentPositioning((state) => state.selectTourStep);
  const stopContentRepositioning = useSlideshowContentPositioning((state) => state.stopRepositioning);
  const stopTextRepositioning = useSlideshowContentPositioning((state) => state.stopTextRepositioning);
  const requestWorkbenchTab = useSlideshowWorkbenchState((state) => state.requestTab);
  const setShowTourSteps = useSlideshowWorkbenchState((state) => state.setShowTourSteps);
  const setCenterPanelMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  const target = useVaultSelector(
    (_, vaultInstance) => getTourStepThumbnailTarget(vaultInstance, annotation, canvas),
    [annotation?.id, annotation?.target, canvas?.id],
  );
  const text = useVaultSelector(
    (_, vaultInstance) => getTourStepPreviewText(vaultInstance, annotation),
    [annotation?.id, annotation?.body, annotation?.label, annotation?.summary],
  );

  return (
    <button
      type="button"
      className="flex gap-2 rounded border border-slate-200 bg-white p-1.5 text-left hover:bg-slate-50"
      onClick={() => {
        onClick();
        edit({ id: canvas.id, type: "Canvas" }, undefined, {
          selectedTab: "@exhibition/tour-steps",
          forceOpen: true,
        });
        if (annotation?.id) selectTourStep(annotation.id);
        stopContentRepositioning();
        stopTextRepositioning();
        setShowTourSteps(true);
        setCenterPanelMode("edit");
        requestWorkbenchTab("tour");
      }}
    >
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
        <LazyThumbnail cover fade={false} region={target.region} singleImage={target.singleImage} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-slate-800">{text.label}</div>
        <div
          className="line-clamp-1 text-xs text-slate-500 [&_*]:m-0 [&_*]:inline"
          dangerouslySetInnerHTML={{
            __html: text.summary,
          }}
        />
      </div>
    </button>
  );
}

function getTourStepPreviewText(vault: any, annotation: any) {
  const body = getResolvedAnnotationBody(vault, annotation);

  if (typeof body?.value === "string") {
    const { label, summary } = splitTourStepHtml(body.value);
    return {
      label: label || getInternationalStringText(annotation.label, "Step"),
      summary,
    };
  }

  return {
    label: getInternationalStringText(annotation.label, "Step"),
    summary: sanitizeSummaryHtml(getInternationalStringText(annotation.summary, "")),
  };
}

function getTourStepThumbnailTarget(vault: any, annotation: any, canvas: any) {
  const target = annotation?.target;
  const source = typeof target === "string" ? null : target?.source;
  const sourceId = typeof source === "string" ? source : source?.id || target?.id;
  const sourceType = typeof source === "string" ? null : source?.type || target?.type;

  if (sourceType === "Annotation" && sourceId) {
    const paintingAnnotation = vault.get({ id: sourceId, type: "Annotation" }, { skipSelfReturn: false } as any);
    return {
      region: paintingAnnotation ? getAnnotationTargetBox(paintingAnnotation, canvas) : undefined,
      singleImage: true,
    };
  }

  const region = getAnnotationTargetBox(annotation, canvas);
  const canvasWidth = Number(canvas?.width) || 1920;
  const canvasHeight = Number(canvas?.height) || 1080;
  const isFullCanvas = region.x === 0 && region.y === 0 && region.width === canvasWidth && region.height === canvasHeight;

  return {
    region: isFullCanvas ? undefined : region,
    singleImage: false,
  };
}

function getFirstAnnotationBodyHtml(vault: any, pageRef: any) {
  const page = pageRef ? vault.get(pageRef as any, { skipSelfReturn: false } as any) : null;

  for (const annotationRef of page?.items || []) {
    const annotation = vault.get(annotationRef as any, { skipSelfReturn: false } as any) || annotationRef;
    const bodies = Array.isArray(annotation?.body) ? annotation.body : [annotation?.body];

    for (const bodyRef of bodies) {
      const body = bodyRef ? vault.get(bodyRef as any, { skipSelfReturn: false } as any) || bodyRef : null;
      if (typeof body?.value === "string" && body.value) {
        return body.value;
      }
    }
  }

  return "";
}
