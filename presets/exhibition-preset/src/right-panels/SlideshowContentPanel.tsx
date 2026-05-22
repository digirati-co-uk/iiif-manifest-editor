import { useCreator } from "@manifest-editor/shell";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "react-aria-components";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import {
  createDefaultSlideContentTarget,
  getPaintingAnnotations,
  setAnnotationTargetBox,
  type SlideContentBox,
  useSlideshowContentPositioning,
} from "../slideshow-content-positioning";

const creatorOptions = {
  skipEditingOnCreate: true,
};

export function SlideshowContentPanel() {
  const canvas = useCanvas();
  const pageRef = canvas?.items?.[0]
    ? { id: canvas.items[0].id, type: "AnnotationPage" }
    : undefined;
  const previousAnnotationCount = useRef(0);
  const {
    selectedAnnotationId,
    selectAnnotation,
    startRepositioning,
    stopRepositioning,
  } = useSlideshowContentPositioning();
  const [canCreateContent, contentActions] = useCreator(
    pageRef,
    "items",
    "Annotation",
    canvas ? (createDefaultSlideContentTarget(canvas) as any) : undefined,
    { isPainting: true },
  );

  const annotations = useVaultSelector(
    (_, vaultInstance) =>
      canvas ? getPaintingAnnotations(vaultInstance, canvas) : [],
    [canvas?.id, pageRef?.id],
  );
  const selectedAnnotation = annotations.find(
    (annotation: any) => annotation.id === selectedAnnotationId,
  );

  useEffect(() => {
    if (!canvas) {
      selectAnnotation(null);
      return;
    }

    const newestAnnotation = annotations[annotations.length - 1];
    if (
      annotations.length > previousAnnotationCount.current &&
      newestAnnotation?.id
    ) {
      selectAnnotation(newestAnnotation.id);
    }

    previousAnnotationCount.current = annotations.length;
  }, [annotations, canvas?.id, selectAnnotation]);

  useEffect(() => {
    if (
      selectedAnnotationId &&
      !annotations.some(
        (annotation: any) => annotation.id === selectedAnnotationId,
      )
    ) {
      selectAnnotation(null);
    }
  }, [annotations, selectAnnotation, selectedAnnotationId]);

  if (!canvas || !pageRef) {
    return (
      <div>
        <FieldLabel>Slide content</FieldLabel>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This slide does not have a content layer yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <FieldLabel>Slide content</FieldLabel>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Add the main image, text, or media shown on this slide. Use Layout,
          Summary, and Tour steps for presentation settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ContentActionCard
          label="Image"
          summary="Add an image from URL, IIIF service, or IIIF Browser."
          disabled={!canCreateContent}
          onPress={() =>
            contentActions.createFiltered("image", undefined, creatorOptions)
          }
        />
        <ContentActionCard
          label="Text"
          summary="Add rich editorial text."
          disabled={!canCreateContent}
          onPress={() =>
            contentActions.creator(
              "@manifest-editor/html-annotation",
              creatorOptions,
            )
          }
        />
        <ContentActionCard
          label="Video"
          summary="Add an MP4 or video file URL."
          disabled={!canCreateContent}
          onPress={() =>
            contentActions.creator(
              "@manifest-editor/video-annotation",
              creatorOptions,
            )
          }
        />
        <ContentActionCard
          label="YouTube"
          summary="Embed a YouTube video."
          disabled={!canCreateContent}
          onPress={() =>
            contentActions.creator("@manifest-editor/youtube", creatorOptions)
          }
        />
      </div>

      <div>
        <FieldLabel>Current content</FieldLabel>
        <SlideshowContentList
          annotations={annotations}
          selectedAnnotationId={selectedAnnotationId}
          onSelect={selectAnnotation}
        />
      </div>

      {selectedAnnotation ? (
        <SlideshowPositionControls
          annotation={selectedAnnotation}
          canvas={canvas}
          onStartReposition={() => startRepositioning(selectedAnnotation.id)}
          onStopReposition={stopRepositioning}
        />
      ) : null}
    </div>
  );
}

function SlideshowContentList({
  annotations,
  selectedAnnotationId,
  onSelect,
}: {
  annotations: any[];
  selectedAnnotationId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (!annotations.length) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        No content on this slide yet.
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {annotations.map((annotation, index) => (
        <Button
          key={annotation.id}
          className={[
            "rounded-lg border p-3 text-left text-sm transition",
            selectedAnnotationId === annotation.id
              ? "border-me-primary-500 bg-me-primary-50 text-slate-900 ring-2 ring-me-primary-100"
              : "border-slate-200 bg-white text-slate-700 hover:border-me-primary-300",
          ].join(" ")}
          onPress={() => onSelect(annotation.id)}
        >
          <span className="block font-semibold">Content {index + 1}</span>
        </Button>
      ))}
    </div>
  );
}

function SlideshowPositionControls({
  annotation,
  canvas,
  onStartReposition,
  onStopReposition,
}: {
  annotation: any;
  canvas: any;
  onStartReposition: () => void;
  onStopReposition: () => void;
}) {
  const vault = useVault();
  const canvasWidth = Number(canvas?.width) || 1920;
  const canvasHeight = Number(canvas?.height) || 1080;
  const setBox = (next: SlideContentBox) =>
    setAnnotationTargetBox(vault, canvas, annotation.id, next);
  const halfWidth = Math.round(canvasWidth / 2);
  const halfHeight = Math.round(canvasHeight / 2);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel>Position</FieldLabel>
        <div className="flex gap-2">
          <Button
            className="rounded-md bg-me-primary-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-me-primary-600"
            onPress={onStartReposition}
          >
            Reposition
          </Button>
          <Button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            onPress={onStopReposition}
          >
            Done
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          {
            label: "Fill slide",
            box: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
          },
          {
            label: "Centre",
            box: {
              x: Math.round(canvasWidth * 0.1),
              y: Math.round(canvasHeight * 0.1),
              width: Math.round(canvasWidth * 0.8),
              height: Math.round(canvasHeight * 0.8),
            },
          },
          {
            label: "Left half",
            box: { x: 0, y: 0, width: halfWidth, height: canvasHeight },
          },
          {
            label: "Right half",
            box: { x: halfWidth, y: 0, width: halfWidth, height: canvasHeight },
          },
          {
            label: "Top",
            box: { x: 0, y: 0, width: canvasWidth, height: halfHeight },
          },
          {
            label: "Bottom",
            box: {
              x: 0,
              y: halfHeight,
              width: canvasWidth,
              height: halfHeight,
            },
          },
        ].map((position) => (
          <Button
            key={position.label}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-me-primary-300 hover:bg-me-primary-50"
            onPress={() => setBox(position.box)}
          >
            {position.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ContentActionCard({
  label,
  summary,
  disabled,
  onPress,
}: {
  label: string;
  summary: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-me-primary-300 hover:bg-me-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
      isDisabled={disabled}
      onPress={onPress}
    >
      <span className="block text-sm font-semibold text-slate-900">
        {label}
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-slate-600">
        {summary}
      </span>
    </Button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className="exhibition-workbench-muted text-sm font-semibold">
      {children}
    </div>
  );
}
