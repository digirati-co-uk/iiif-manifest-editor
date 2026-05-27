import { LazyThumbnail, Sidebar, SidebarContent } from "@manifest-editor/components";
import {
  BehaviorEditor,
  type BehaviorEditorProps,
  DimensionsTriplet,
  InputContainer,
  useInStack,
} from "@manifest-editor/editors";
import { type EditorDefinition, useEditor, useLocalStorage } from "@manifest-editor/shell";
import { useState } from "react";
import { Button } from "react-aria-components";
import { useCanvas, useManifest, useVault } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { AspectRatioWarning } from "../components/AspectRatioWarning";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";

type EditingMode = "simple" | "advanced";
type LayoutEditingContext = "default" | "slideshow";
export type LayoutPreset = "image" | "right" | "left" | "bottom";
export type DisplayWidth = 12 | 8 | 6 | 4;

const layoutBehaviors = new Set(["left", "right", "bottom", "top", "image"]);
export const layoutPresetOptions: Array<{
  value: LayoutPreset;
  label: string;
}> = [
  { value: "image", label: "Image only" },
  { value: "right", label: "Image + text right" },
  { value: "left", label: "Image + text left" },
  { value: "bottom", label: "Image + text bottom" },
];
export const simpleLayoutColours = {
  primary: "var(--exhibition-primary, #b84c74)",
  fieldBorder: "var(--exhibition-field-border, #dcd5ce)",
  fieldBackground: "var(--exhibition-field-bg, #f8f6f3)",
  text: "var(--exhibition-text, #25211f)",
  muted: "var(--exhibition-muted, #6a625c)",
  buttonBackground: "var(--exhibition-button-bg, #ffffff)",
  buttonText: "var(--exhibition-button-text, #ffffff)",
  inactiveButtonText: "var(--exhibition-inactive-button-text, #332f2c)",
};
const displayWidthOptions: Array<{
  value: DisplayWidth;
  label: string;
}> = [
  { value: 12, label: "Full width" },
  { value: 8, label: "2/3 width" },
  { value: 6, label: "Half width" },
  { value: 4, label: "1/3 width" },
];
const floatingBehaviors = new Set(["float-top-left", "float-top-right", "float-bottom-left", "float-bottom-right"]);
const layoutPanelModeStorageKey = "exhibition-layout-panel-mode";

export const customBehaviourEditor: EditorDefinition = {
  component: () => <SlideBehavioursPanel />,
  supports: {
    edit: true,
    resourceTypes: ["Canvas"],
    properties: ["behavior"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource, vault)) return false;
      // The standalone layout panel is not shown for textual-content (info box) canvases;
      // they get their own layout section inside the workbench editor.
      return !isInfoBoxCanvas(resource, vault);
    },
  },
  id: "slide-behaviors",
  label: "Layout",
  tabs: {
    showTitle: true,
  },
};

const exhibitionConfigs: BehaviorEditorProps["configs"] = [
  {
    id: "layout",
    type: "choice",
    label: { en: ["Layout"] },
    initialOpen: true,
    items: [
      {
        label: { en: ["Text on left"] },
        value: "left",
      },
      {
        label: { en: ["Text on right"] },
        value: "right",
      },
      {
        label: { en: ["Text on bottom"] },
        value: "bottom",
      },
      {
        label: { en: ["Text on top"] },
        value: "top",
      },
      {
        label: { en: ["Only image"] },
        value: "image",
      },
    ],
  },
  {
    id: "floating",
    type: "choice",
    label: { en: ["Floating"] },
    initialOpen: false,
    addNone: true,
    groupBehavior: "floating",
    items: [
      {
        label: { en: ["Float top left"] },
        value: "float-top-left",
      },
      {
        label: { en: ["Float top right"] },
        value: "float-top-right",
      },
      {
        label: { en: ["Float bottom left"] },
        value: "float-bottom-left",
      },
      {
        label: { en: ["Float bottom right"] },
        value: "float-bottom-right",
      },
    ],
  },
  {
    id: "size",
    component: (existing, setBehaviors) => <EditSize behaviors={existing} setBehaviors={setBehaviors} />,
    label: { en: ["Size"] },
    type: "custom",
    initialOpen: true,
    supports: (b) => b.startsWith("w-") || b.startsWith("h-"),
  },
];

export function RoundGridIcon(props: { index: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill={props.index === 0 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M5 11h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2"
      />
      <path
        fill={props.index === 1 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M5 21h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2"
      />
      <path
        fill={props.index === 2 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M13 5v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2"
      />
      <path
        fill={props.index === 3 ? "currentColor" : "none"}
        stroke="currentColor"
        d="M15 21h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2"
      />
    </svg>
  );
}

function parseBehaviors(items: string[]) {
  let width = 0;
  let height = 0;

  for (const item of items) {
    if (item.startsWith("w-")) {
      width = Number.parseInt(item.slice(2));
    }
    if (item.startsWith("h-")) {
      height = Number.parseInt(item.slice(2));
    }
  }

  return {
    width,
    height,
  };
}

function removeLayoutBehaviors(behavior: string[]) {
  return behavior.filter(
    (item) =>
      !layoutBehaviors.has(item) &&
      !item.startsWith("w-") &&
      !item.startsWith("h-") &&
      !floatingBehaviors.has(item) &&
      item !== "cover",
  );
}

export function EditSize({
  behaviors,
  setBehaviors,
}: {
  behaviors: string[];
  setBehaviors: (behaviors: string[]) => void;
}) {
  const { width, height } = parseBehaviors(behaviors);
  const [hoverPosition, setHoverPosition] = useState({ x: -1, y: -1 });

  const setBehavior = (w: number, h: number) => {
    const newBehaviors = behaviors.filter((b) => {
      return !b.startsWith("w-") && !b.startsWith("h-");
    });

    newBehaviors.push(`w-${w}`);
    newBehaviors.push(`h-${h}`);

    setBehaviors(newBehaviors);
  };

  const cells = Array.from({ length: 144 }, (_, i) => {
    const x = i % 12;
    const y = Math.floor(i / 12);
    const hovered = hoverPosition.x >= x && hoverPosition.y >= y;
    const selected = x < width && y < height;
    const hoveredAndSelected = hovered && selected;

    let bgClass = "bg-gray-200";
    if (hovered) {
      bgClass = "bg-me-200";
    }
    if (selected) {
      bgClass = "bg-me-500";
    }
    if (hoveredAndSelected) {
      bgClass = "bg-me-400";
    }

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div
        key={i}
        className={`flex aspect-square rounded cursor-se-resize items-center justify-center ${bgClass}`}
        onClick={() => setBehavior(x + 1, y + 1)}
        onMouseUp={() => setBehavior(x + 1, y + 1)}
        onMouseEnter={() => setHoverPosition({ x, y })}
      />
    );
  });

  return (
    <div className="grid grid-cols-12 grid-rows-12 gap-1" onMouseLeave={() => setHoverPosition({ x: -1, y: -1 })}>
      {cells}
    </div>
  );
}

export function SlideBehavioursPanel() {
  const [mode, setMode] = useLocalStorage<EditingMode>(layoutPanelModeStorageKey, "simple");

  return (
    <Sidebar>
      <SidebarContent className="bg-white px-6 pt-5 pb-20">
        <div className="mb-6 flex justify-center">
          <SimpleAdvancedToggle value={mode} onChange={setMode} />
        </div>
        <SlideBehavioursContent mode={mode} />
      </SidebarContent>
    </Sidebar>
  );
}

export function SlideBehavioursContent({
  mode = "advanced",
  layoutContext = "default",
}: {
  mode?: EditingMode;
  layoutContext?: LayoutEditingContext;
}) {
  const canvas = useInStack("Canvas");
  const editor = useEditor();
  const { width, height } = editor.technical;

  if (!canvas || editor.technical.type !== "Canvas") {
    return <div className="p-4">Please select canvas</div>;
  }

  if (mode === "simple") {
    return (
      <SimpleSlideLayoutEditor
        behavior={editor.technical.behavior.get() || []}
        layoutContext={layoutContext}
        canvasWidth={width.get() || 0}
        canvasHeight={height.get() || 0}
        onChange={(v) => {
          editor.technical.behavior.set(v);
        }}
      />
    );
  }

  return (
    <>
      <div className="px-2">
        <InputContainer $wide>
          <DimensionsTriplet
            widthId={width.containerId()}
            width={width.get() || 0}
            changeWidth={(v) => width.set(v)}
            heightId={height.containerId()}
            height={height.get() || 0}
            changeHeight={(v) => height.set(v)}
          />
          <div>
            <AspectRatioWarning />
          </div>
        </InputContainer>
      </div>

      <BehaviorEditor
        behavior={editor.technical.behavior.get() || []}
        onChange={(v) => {
          editor.technical.behavior.set(v);
        }}
        configs={exhibitionConfigs}
      />
    </>
  );
}

function SimpleSlideLayoutEditor({
  behavior,
  layoutContext,
  canvasWidth,
  canvasHeight,
  onChange,
}: {
  behavior: string[];
  layoutContext: LayoutEditingContext;
  canvasWidth: number;
  canvasHeight: number;
  onChange: (newValue: string[]) => void;
}) {
  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>(getLayoutPreset(behavior));
  const [displayWidth, setDisplayWidth] = useState<DisplayWidth>(
    layoutContext === "slideshow" ? 12 : getDisplayWidth(behavior),
  );
  const [floating, setFloating] = useState(hasFloatingBehavior(behavior));
  const [cover, setCover] = useState(behavior.includes("cover"));
  const requestWorkbenchTab = useSlideshowWorkbenchState((state) => state.requestTab);
  const canvas = useCanvas();
  const vault = useVault();
  const manifest = useManifest();
  const selectedWidth = layoutContext === "slideshow" ? 12 : displayWidth;
  const previewHeight = getDerivedHeight({
    canvasWidth,
    canvasHeight,
    layoutPreset,
    displayWidth: selectedWidth,
  });

  const fitSuggestion =
    layoutContext === "default" && manifest?.items && canvas
      ? computeFitWidth(canvas.id, manifest.items as Array<{ id: string }>, vault)
      : null;

  const applySettings = (next: {
    layoutPreset?: LayoutPreset;
    displayWidth?: DisplayWidth;
    floating?: boolean;
    cover?: boolean;
  }) => {
    const nextLayoutPreset = next.layoutPreset ?? layoutPreset;
    const nextDisplayWidth = layoutContext === "slideshow" ? 12 : (next.displayWidth ?? displayWidth);
    const nextFloating = next.floating ?? floating;
    const nextCover = next.cover ?? cover;

    onChange(
      buildSimpleLayoutBehaviors({
        behavior,
        layoutPreset: nextLayoutPreset,
        displayWidth: nextDisplayWidth,
        canvasWidth,
        canvasHeight,
        floating: nextFloating,
        cover: nextCover,
      }),
    );
  };

  return (
    <div className="flex flex-col gap-7">
      <SimpleLayoutPreview
        layoutPreset={layoutPreset}
        cover={cover}
        floating={floating}
        width={selectedWidth}
        height={previewHeight}
        onTextClick={() => requestWorkbenchTab("summary")}
      />

      <SimpleField>
        <SimpleFieldLabel>Layout preset</SimpleFieldLabel>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {layoutPresetOptions.map((option) => (
            <LayoutPresetCard
              key={option.value}
              preset={option.value}
              label={option.label}
              selected={layoutPreset === option.value}
              onClick={() => {
                setLayoutPreset(option.value);
                applySettings({ layoutPreset: option.value });
              }}
            />
          ))}
        </div>
      </SimpleField>

      {layoutContext === "default" ? (
        <SimpleField>
          <SimpleFieldLabel>Width</SimpleFieldLabel>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {displayWidthOptions.map((option) => (
              <SimpleOptionButton
                key={option.value}
                selected={displayWidth === option.value}
                onClick={() => {
                  setDisplayWidth(option.value);
                  applySettings({ displayWidth: option.value });
                }}
              >
                {option.label}
              </SimpleOptionButton>
            ))}
          </div>
        </SimpleField>
      ) : null}

      {fitSuggestion ? (
        <SimpleField>
          <SimpleFieldLabel>Fit alongside {fitSuggestion.neighbour} slide</SimpleFieldLabel>
          <div className="mt-3">
            <SimpleOptionButton
              selected={displayWidth === fitSuggestion.width}
              onClick={() => {
                setDisplayWidth(fitSuggestion.width as DisplayWidth);
                applySettings({ displayWidth: fitSuggestion.width as DisplayWidth });
              }}
            >
              w-{fitSuggestion.width} — fills remaining space
            </SimpleOptionButton>
          </div>
        </SimpleField>
      ) : null}

      <div className="flex flex-col gap-3">
        <SimpleCheckbox
          checked={floating}
          label="Floating"
          onChange={(checked) => {
            setFloating(checked);
            applySettings({ floating: checked });
          }}
        />
        <SimpleCheckbox
          checked={cover}
          label="Image cover"
          onChange={(checked) => {
            setCover(checked);
            applySettings({ cover: checked });
          }}
        />
      </div>
    </div>
  );
}

function SimpleLayoutPreview({
  layoutPreset,
  cover,
  floating,
  width,
  height,
  onTextClick,
}: {
  layoutPreset: LayoutPreset;
  cover: boolean;
  floating: boolean;
  width: DisplayWidth;
  height: number;
  onTextClick: () => void;
}) {
  const isBottom = layoutPreset === "bottom";
  const isImage = layoutPreset === "image";
  const isLeft = layoutPreset === "left";

  return (
    <div>
      <div
        className="relative mx-auto overflow-hidden rounded-md border bg-[#f8f6f3] shadow-sm"
        style={{
          width: `${Math.max(33, Math.round((width / 12) * 100))}%`,
          aspectRatio: `${width} / ${height}`,
          borderColor: simpleLayoutColours.fieldBorder,
        }}
      >
        <div
          className={twMerge(
            "flex h-full w-full min-h-0",
            isLeft ? "flex-row-reverse" : isBottom ? "flex-col" : "flex-row",
          )}
        >
          <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
            <div className="absolute inset-0">
              <LazyThumbnail cover={cover} fade={false} />
            </div>
          </div>
          {isImage ? null : (
            <button
              type="button"
              className={twMerge(
                "flex-shrink-0 border-0 bg-[#25211f] p-3 text-left text-white transition-colors hover:bg-[#332f2c] focus:outline-none focus:ring-2 focus:ring-me-primary-500 focus:ring-offset-2",
                isBottom ? "h-1/3 w-full" : "h-full w-1/3",
              )}
              onClick={onTextClick}
            >
              <TextLines tone="light" />
            </button>
          )}
        </div>
        {floating ? (
          <div className="absolute right-2 top-2 h-7 w-10 rounded bg-white/90 shadow ring-1 ring-black/10" />
        ) : null}
      </div>
      <div className="mt-2 text-center text-xs" style={{ color: simpleLayoutColours.muted }}>
        w-{width} h-{height}
      </div>
    </div>
  );
}

export function LayoutPresetCard({
  preset,
  label,
  selected,
  onClick,
}: {
  preset: LayoutPreset;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-md border px-3 py-4 text-center text-sm font-semibold transition-colors"
      style={{
        backgroundColor: selected ? simpleLayoutColours.primary : simpleLayoutColours.buttonText,
        borderColor: selected ? simpleLayoutColours.primary : simpleLayoutColours.fieldBorder,
        color: selected ? simpleLayoutColours.buttonText : simpleLayoutColours.inactiveButtonText,
      }}
      onClick={onClick}
    >
      <LayoutPresetIcon preset={preset} selected={selected} />
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function LayoutPresetIcon({ preset, selected }: { preset: LayoutPreset; selected: boolean }) {
  const isImage = preset === "image";
  const isBottom = preset === "bottom";
  const isLeft = preset === "left";
  const textClass = selected ? "bg-white/80" : "bg-[#25211f]";
  const imageClass = selected ? "bg-white/25 ring-white/70" : "bg-[#f8f6f3] ring-[#dcd5ce]";

  return (
    <span
      className={twMerge(
        "flex h-12 w-16 gap-1 overflow-hidden rounded border p-1",
        selected ? "border-white/70 bg-white/15" : "border-[#dcd5ce] bg-white",
        isLeft ? "flex-row-reverse" : isBottom ? "flex-col" : "flex-row",
      )}
      aria-hidden="true"
    >
      <span className={twMerge("flex-1 rounded-sm ring-1", imageClass)} />
      {isImage ? null : (
        <span
          className={twMerge(
            "flex flex-shrink-0 flex-col justify-center gap-0.5 rounded-sm px-0.5",
            textClass,
            isBottom ? "h-3 w-full" : "h-full w-4",
          )}
        >
          <TextLines compact tone={selected ? "dark" : "light"} />
        </span>
      )}
    </span>
  );
}

function TextLines({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  const lineClass = tone === "light" ? "bg-white/70" : "bg-[#8b3f61]/70";

  return (
    <span className={twMerge("block space-y-1.5", compact ? "space-y-0.5" : "mt-1")} aria-hidden="true">
      <span className={twMerge("block rounded", lineClass, compact ? "h-0.5 w-full" : "h-1.5 w-3/4")} />
      <span className={twMerge("block rounded", lineClass, compact ? "h-0.5 w-4/5" : "h-1.5 w-full")} />
      <span className={twMerge("block rounded", lineClass, compact ? "h-0.5 w-2/3" : "h-1.5 w-2/3")} />
    </span>
  );
}

export function SimpleOptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
      style={{
        backgroundColor: selected ? simpleLayoutColours.primary : simpleLayoutColours.buttonText,
        borderColor: selected ? simpleLayoutColours.primary : simpleLayoutColours.fieldBorder,
        color: selected ? simpleLayoutColours.buttonText : simpleLayoutColours.inactiveButtonText,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SimpleCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex items-center justify-between rounded-md border px-4 py-3 text-sm font-semibold"
      style={{
        backgroundColor: simpleLayoutColours.fieldBackground,
        borderColor: simpleLayoutColours.fieldBorder,
        color: simpleLayoutColours.text,
      }}
    >
      {label}
      <input
        type="checkbox"
        className="h-4 w-4 accent-me-primary-500"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
    </label>
  );
}

export function SimpleAdvancedToggle({
  value,
  onChange,
}: {
  value: EditingMode;
  onChange: (value: EditingMode) => void;
}) {
  return (
    <div className="grid w-full max-w-[240px] grid-cols-2 rounded-full bg-[#f5eaf0] p-1">
      {(["simple", "advanced"] as EditingMode[]).map((option) => {
        const selected = value === option;

        return (
          <Button
            key={option}
            className="border-none rounded-full bg-transparent px-4 py-2 text-sm font-semibold capitalize transition-colors"
            style={{
              backgroundColor: selected ? simpleLayoutColours.primary : "transparent",
              color: selected ? "#ffffff" : "#8b3f61",
              boxShadow: selected ? "0 1px 3px rgba(15, 23, 42, 0.18)" : "none",
            }}
            onPress={() => onChange(option)}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}

export function SimpleField({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SimpleFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-semibold" style={{ color: simpleLayoutColours.muted }}>
      {children}
    </div>
  );
}

export function getLayoutPreset(behavior: string[]): LayoutPreset {
  if (behavior.includes("image")) return "image";
  if (behavior.includes("left")) return "left";
  if (behavior.includes("bottom")) return "bottom";
  if (behavior.includes("right")) return "right";
  return "image";
}

export function buildLayoutPresetBehaviors(behavior: string[], layoutPreset: LayoutPreset) {
  return [...behavior.filter((item) => !layoutBehaviors.has(item)), layoutPreset];
}

function getDisplayWidth(behavior: string[]): DisplayWidth {
  const { width } = parseBehaviors(behavior);

  if (!width) return 12;
  if (width <= 4) return 4;
  if (width <= 6) return 6;
  if (width <= 8) return 8;
  return 12;
}

function hasFloatingBehavior(behavior: string[]) {
  return behavior.some((item) => floatingBehaviors.has(item));
}

function buildSimpleLayoutBehaviors({
  behavior,
  layoutPreset,
  displayWidth,
  canvasWidth,
  canvasHeight,
  floating,
  cover,
}: {
  behavior: string[];
  layoutPreset: LayoutPreset;
  displayWidth: DisplayWidth;
  canvasWidth: number;
  canvasHeight: number;
  floating: boolean;
  cover: boolean;
}) {
  const next = removeLayoutBehaviors(behavior);
  const height = getDerivedHeight({
    canvasWidth,
    canvasHeight,
    layoutPreset,
    displayWidth,
  });

  next.push(layoutPreset, `w-${displayWidth}`, `h-${height}`);

  if (floating) {
    next.push("float-top-right");
  }

  if (cover) {
    next.push("cover");
  }

  return next;
}

function getDerivedHeight({
  canvasWidth,
  canvasHeight,
  layoutPreset,
  displayWidth,
}: {
  canvasWidth: number;
  canvasHeight: number;
  layoutPreset: LayoutPreset;
  displayWidth: DisplayWidth;
}) {
  const ratio = canvasWidth && canvasHeight ? canvasWidth / canvasHeight : 1.5;
  const effectiveWidth = layoutPreset === "left" || layoutPreset === "right" ? displayWidth * (2 / 3) : displayWidth;
  const textHeightMultiplier = layoutPreset === "bottom" ? 3 / 2 : 1;
  const height = Math.round((effectiveWidth / ratio) * textHeightMultiplier);

  return Math.max(1, Math.min(12, height));
}

// ─── Textual-content (info-box) layout editor ───────────────────────────────

export const textualWidthOptions: Array<{ value: DisplayWidth; label: string }> = [
  { value: 4, label: "1/3 width" },
  { value: 6, label: "Half width" },
  { value: 8, label: "2/3 width" },
  { value: 12, label: "Full width" },
];

/** Returns the w-* value (1-12) parsed from a behavior array, or 0 if absent. */
export function getBehaviorWidth(behavior: string[]): number {
  const { width } = parseBehaviors(behavior);
  return width;
}

/**
 * When there is a gap in the 12-column grid caused by the surrounding canvases,
 * return a suggested width that fills the gap. Returns null if no gap exists or
 * the canvas has no immediate neighbours with known widths.
 *
 * A "gap" means that a single neighbouring canvas (prev or next) uses less than
 * the full 12 columns, so this canvas could sit beside it. We only offer the fit
 * value when the gap is non-trivial (i.e. the neighbour width is between 4 and 8
 * and is one of the standard snap values).
 */
export function computeFitWidth(
  currentCanvasId: string,
  manifestItems: Array<{ id: string }>,
  vault: ReturnType<typeof useVault>,
): { width: number; neighbour: "previous" | "next" } | null {
  const idx = manifestItems.findIndex((c) => c.id === currentCanvasId);
  if (idx === -1) return null;

  const getWidth = (canvasRef: { id: string } | undefined): number => {
    if (!canvasRef) return 0;
    try {
      const c = vault.get(canvasRef as any) as any;
      return getBehaviorWidth(c?.behavior || []);
    } catch {
      return 0;
    }
  };

  const prevWidth = getWidth(manifestItems[idx - 1]);
  const nextWidth = getWidth(manifestItems[idx + 1]);

  // Check if the previous canvas leaves a gap (and next slot isn't already filled)
  if (prevWidth > 0 && prevWidth < 12) {
    const gap = 12 - prevWidth;
    if (gap >= 4) {
      return { width: gap as DisplayWidth, neighbour: "previous" };
    }
  }

  // Check if the next canvas leaves a gap
  if (nextWidth > 0 && nextWidth < 12) {
    const gap = 12 - nextWidth;
    if (gap >= 4) {
      return { width: gap as DisplayWidth, neighbour: "next" };
    }
  }

  return null;
}

export function TextualContentLayoutEditor() {
  const [mode, setMode] = useLocalStorage<EditingMode>(layoutPanelModeStorageKey, "simple");
  const canvas = useCanvas();
  const vault = useVault();
  const manifest = useManifest();
  const editor = useEditor();

  if (!canvas || editor.technical.type !== "Canvas") {
    return <div className="p-4">Please select canvas</div>;
  }

  const behavior = editor.technical.behavior.get() || [];
  const currentWidth = (getBehaviorWidth(behavior) as DisplayWidth) || 12;

  const setWidth = (w: DisplayWidth) => {
    const next = behavior.filter((b) => !b.startsWith("w-") && !b.startsWith("h-"));
    // Keep h- if present, otherwise default to h-4 for text boxes
    const existingH = behavior.find((b) => b.startsWith("h-"));
    next.push(`w-${w}`);
    if (!existingH) next.push("h-4");
    editor.technical.behavior.set(next);
  };

  const fitSuggestion =
    manifest?.items && canvas ? computeFitWidth(canvas.id, manifest.items as Array<{ id: string }>, vault) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <SimpleAdvancedToggle value={mode} onChange={setMode} />
      </div>

      {mode === "simple" ? (
        <>
          <SimpleField>
            <SimpleFieldLabel>Width</SimpleFieldLabel>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {textualWidthOptions.map((option) => (
                <SimpleOptionButton
                  key={option.value}
                  selected={currentWidth === option.value}
                  onClick={() => setWidth(option.value)}
                >
                  {option.label}
                </SimpleOptionButton>
              ))}
            </div>
          </SimpleField>

          {fitSuggestion ? (
            <SimpleField>
              <SimpleFieldLabel>Fit alongside {fitSuggestion.neighbour} slide</SimpleFieldLabel>
              <div className="mt-3">
                <SimpleOptionButton
                  selected={currentWidth === fitSuggestion.width}
                  onClick={() => setWidth(fitSuggestion.width as DisplayWidth)}
                >
                  w-{fitSuggestion.width} — fills remaining space
                </SimpleOptionButton>
              </div>
            </SimpleField>
          ) : null}

          <div className="mt-1 text-center text-xs" style={{ color: simpleLayoutColours.muted }}>
            w-{currentWidth}
          </div>
        </>
      ) : (
        <>
          <div className="px-2">
            <InputContainer $wide>
              <DimensionsTriplet
                widthId={editor.technical.width.containerId()}
                width={editor.technical.width.get() || 0}
                changeWidth={(v) => editor.technical.width.set(v)}
                heightId={editor.technical.height.containerId()}
                height={editor.technical.height.get() || 0}
                changeHeight={(v) => editor.technical.height.set(v)}
              />
            </InputContainer>
          </div>

          <BehaviorEditor
            behavior={behavior}
            onChange={(v) => editor.technical.behavior.set(v)}
            configs={[
              {
                id: "size",
                component: (existing, setBehaviors) => <EditSize behaviors={existing} setBehaviors={setBehaviors} />,
                label: { en: ["Size"] },
                type: "custom",
                initialOpen: true,
                supports: (b) => b.startsWith("w-") || b.startsWith("h-"),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
