import {
  getInternationalStringText,
  resolveContentResource,
  useAnnotationThumbnail,
} from "@manifest-editor/editors";
import { useCreator } from "@manifest-editor/shell";
import { type ReactNode } from "react";
import { Button } from "react-aria-components";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import {
  getSlideContentLayers,
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";

export function SlideshowContentPanel() {
  const canvas = useCanvas();
  const pageRef = canvas?.items?.[0]
    ? { id: canvas.items[0].id, type: "AnnotationPage" }
    : undefined;
  const [, contentActions] = useCreator(
    pageRef,
    "items",
    "Annotation",
    canvas ? { id: canvas.id, type: "Canvas" } : undefined,
    { isPainting: true },
  );
  const {
    selectedAnnotationId,
    repositioningAnnotationId,
    selectAnnotation,
    startRepositioning,
    stopRepositioning,
  } = useSlideshowContentPositioning();
  const setShowTourSteps = useSlideshowWorkbenchState(
    (state) => state.setShowTourSteps,
  );
  const layers = useVaultSelector(
    (_, vaultInstance) =>
      canvas ? getSlideContentLayers(vaultInstance, canvas) : [],
    [canvas?.id, pageRef?.id],
  );

  if (!canvas || !pageRef) {
    return (
      <div>
        <FieldLabel>Content on this slide</FieldLabel>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This slide does not have a content layer yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <FieldLabel>Content on this slide</FieldLabel>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Select a painting annotation to highlight it in the workbench. Use the
          centre panel to add, position, and edit slide content.
        </p>
      </div>

      {!layers.length ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No painting annotations on this slide yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {layers.map((layer, index) => (
            <ContentInventoryItem
              key={layer.annotation.id}
              layer={layer}
              index={index}
              selected={selectedAnnotationId === layer.annotation.id}
              repositioning={repositioningAnnotationId === layer.annotation.id}
              onSelect={() => {
                setShowTourSteps(false);
                selectAnnotation(layer.annotation.id);
              }}
              onReposition={() => {
                setShowTourSteps(false);
                startRepositioning(layer.annotation.id);
              }}
              onStopReposition={stopRepositioning}
              onAdvancedEdit={() =>
                contentActions.edit(
                  { id: layer.annotation.id, type: "Annotation" },
                  index,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentInventoryItem({
  layer,
  index,
  selected,
  repositioning,
  onSelect,
  onReposition,
  onStopReposition,
  onAdvancedEdit,
}: {
  layer: ReturnType<typeof getSlideContentLayers>[number];
  index: number;
  selected: boolean;
  repositioning: boolean;
  onSelect: () => void;
  onReposition: () => void;
  onStopReposition: () => void;
  onAdvancedEdit: () => void;
}) {
  const vault = useVault();
  const thumbnail = useAnnotationThumbnail({
    annotationId: layer.annotation.id,
    options: { maxWidth: 96, maxHeight: 96 },
  });
  const body = getAnnotationBody(layer.annotation, vault);
  const type = getLayerType(layer, body);
  const label = getContentLabel(layer, body, index);
  const detail = getContentDetail(layer, body, type);

  return (
    <div
      className={[
        "rounded-lg border bg-white p-3 transition",
        selected
          ? "border-me-primary-500 bg-me-primary-50 ring-2 ring-me-primary-100"
          : "border-slate-200",
      ].join(" ")}
    >
      <Button
        className="flex w-full items-center gap-3 border-none bg-transparent p-0 text-left"
        onPress={onSelect}
      >
        <ContentThumbnail thumbnailUrl={thumbnail?.id} type={type} />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-me-primary-500">
            {type}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {detail}
          </span>
        </span>
      </Button>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {repositioning
            ? "Drag or resize in the workbench"
            : selected
              ? "Selected in workbench"
              : "Click to select on slide"}
        </span>
        <div className="flex gap-2">
          <Button
            className="rounded-md border border-me-primary-200 bg-me-primary-50 px-3 py-1.5 text-xs font-semibold text-me-primary-600 transition hover:bg-me-primary-100"
            onPress={repositioning ? onStopReposition : onReposition}
          >
            {repositioning ? "Done moving" : "Reposition"}
          </Button>
          <Button
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            onPress={onAdvancedEdit}
          >
            Advanced edit
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentThumbnail({
  thumbnailUrl,
  type,
}: {
  thumbnailUrl?: string;
  type: string;
}) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
      {thumbnailUrl ? (
        <img
          alt=""
          className="h-full w-full object-cover"
          src={thumbnailUrl}
        />
      ) : (
        <span>{type}</span>
      )}
    </div>
  );
}

function getLayerType(
  layer: ReturnType<typeof getSlideContentLayers>[number],
  body?: any,
) {
  if (layer.imageUrl) return "Image";
  if (layer.youtubeId) return "YouTube";
  if (layer.videoUrl) return "Video";
  if (layer.html !== null) return "Text";
  if (body?.type === "Canvas") return "Canvas";
  if (body?.type) return String(body.type);
  return "Media";
}

function getContentLabel(
  layer: ReturnType<typeof getSlideContentLayers>[number],
  body: any,
  index: number,
) {
  const bodyLabel = getInternationalStringText(body?.label, "");
  const annotationLabel = getInternationalStringText(layer.annotation.label, "");
  const htmlLabel = layer.html ? stripHtml(layer.html).slice(0, 80) : "";

  return (
    bodyLabel ||
    annotationLabel ||
    htmlLabel ||
    `${getLayerType(layer, body)} layer ${index + 1}`
  );
}

function getContentDetail(
  layer: ReturnType<typeof getSlideContentLayers>[number],
  body: any,
  type: string,
) {
  const position = `${Math.round(layer.box.x)}, ${Math.round(
    layer.box.y,
  )} · ${Math.round(layer.box.width)} x ${Math.round(layer.box.height)}`;
  const format = body?.format || body?.profile || body?.type;

  return [format || `${type} painting annotation`, `Position ${position}`]
    .filter(Boolean)
    .join(" · ");
}

function getAnnotationBody(annotation: any, vault: any) {
  const body = Array.isArray(annotation?.body)
    ? annotation.body[0]
    : annotation?.body;
  return resolveContentResource(vault, body);
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className="exhibition-workbench-muted text-sm font-semibold">
      {children}
    </div>
  );
}
