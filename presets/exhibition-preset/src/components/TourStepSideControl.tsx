import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useCanvas, useVault } from "react-iiif-vault/presentation-4";
import {
  type FloatingBehavior,
  FloatingPositionIcon,
  floatingBehaviorOptions,
  floatingGridWithCenter,
  getFloatingBehavior,
  hasFloatingBehavior,
} from "../right-panels/SlideBehaviours";
import { useSlideshowContentPositioning } from "../slideshow-content-positioning";

export type TourStepSide = "" | "left" | "right";

export function getTourStepSide(behavior: unknown): TourStepSide {
  const items = Array.isArray(behavior) ? behavior : [];
  if (items.includes("left")) return "left";
  if (items.includes("right")) return "right";
  return "";
}

export function withTourStepSideBehavior(behavior: unknown, side: TourStepSide) {
  const next = (Array.isArray(behavior) ? behavior : []).filter((item) => item !== "left" && item !== "right");
  if (side) next.push(side);
  return next;
}

export function withTourStepFloatingBehavior(behavior: unknown, floating: "" | FloatingBehavior) {
  const values = new Set(floatingBehaviorOptions.map((option) => option.value));
  const next = (Array.isArray(behavior) ? behavior : []).filter((item) => !values.has(item as FloatingBehavior));
  if (floating) next.push(floating);
  return next;
}

export function TourStepSideControl({ annotation }: { annotation: any }) {
  const vault = useVault();
  const canvas = useCanvas();
  const selectTourStep = useSlideshowContentPositioning((state) => state.selectTourStep);
  const side = getTourStepSide(annotation?.behavior);
  const showFloating = hasFloatingBehavior(Array.isArray(canvas?.behavior) ? canvas.behavior : []);
  const annotationBehavior = Array.isArray(annotation?.behavior) ? annotation.behavior : [];
  const hasFloatingOverride = annotationBehavior.some((item: string) => item.startsWith("float-"));
  const floating = getFloatingBehavior(annotationBehavior);

  if (!annotation?.id) return null;

  const showInPreview = () => {
    selectTourStep(annotation.id);
  };

  const setSide = (nextSide: TourStepSide) => {
    vault.modifyEntityField(
      { id: annotation.id, type: "Annotation" },
      "behavior",
      withTourStepSideBehavior(annotation.behavior, nextSide),
    );
    showInPreview();
  };
  const setFloating = (nextFloating: "" | FloatingBehavior) => {
    vault.modifyEntityField(
      { id: annotation.id, type: "Annotation" },
      "behavior",
      withTourStepFloatingBehavior(annotation.behavior, nextFloating),
    );
    showInPreview();
  };

  return (
    <div className="flex flex-col gap-2">
      {!showFloating ? (
        <div className="grid grid-cols-3 overflow-hidden rounded border border-slate-200 text-xs font-semibold">
          {[
            { value: "" as const, label: "Default" },
            { value: "left" as const, label: "Left" },
            { value: "right" as const, label: "Right" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              className={
                side === option.value ? "bg-me-primary-500 px-2 py-1 text-white" : "bg-white px-2 py-1 text-slate-700"
              }
              onClick={() => setSide(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {showFloating ? (
        <FloatingOverrideMenu value={hasFloatingOverride ? floating : ""} onChange={setFloating} />
      ) : null}
    </div>
  );
}

function FloatingOverrideMenu({
  value,
  onChange,
}: {
  value: "" | FloatingBehavior;
  onChange: (value: "" | FloatingBehavior) => void;
}) {
  const hasOverride = Boolean(value);

  return (
    <span title="Floating position override" className="inline-flex">
      <DialogTrigger>
        <Button
          aria-label="Floating position override"
          className={`relative inline-grid h-8 w-8 place-items-center rounded-md border bg-white shadow-sm outline-none transition-colors hover:border-me-primary-400 focus-visible:ring-2 focus-visible:ring-me-500 ${
            hasOverride ? "border-me-primary-500 text-me-primary-600" : "border-slate-200 text-slate-500"
          }`}
        >
          <FloatingPositionIcon position={value} />
          {hasOverride ? (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-me-primary-500 ring-2 ring-white" />
          ) : null}
        </Button>
        <Popover placement="bottom" style={{ zIndex: 1000010 }}>
          <div className="manifest-editor">
            <Dialog className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg outline-none">
              {({ close }) => (
                <div className="grid grid-cols-3 gap-1">
                  {floatingGridWithCenter("No override").map((option) => (
                    <button
                      key={option.value || "none"}
                      type="button"
                      aria-label={option.label}
                      title={option.label}
                      onClick={() => {
                        onChange(option.value);
                        close();
                      }}
                      className={`grid h-8 w-8 place-items-center rounded-md border outline-none transition-colors hover:border-me-primary-400 hover:bg-me-primary-50 focus-visible:ring-2 focus-visible:ring-me-500 ${
                        value === option.value
                          ? "border-me-primary-500 bg-me-primary-50 text-me-primary-600"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      <FloatingPositionIcon position={option.value} />
                    </button>
                  ))}
                </div>
              )}
            </Dialog>
          </div>
        </Popover>
      </DialogTrigger>
    </span>
  );
}
