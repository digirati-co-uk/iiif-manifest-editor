import { LazyThumbnail, Sidebar, SidebarContent } from "@manifest-editor/components";
import {
  BehaviorEditor,
  type BehaviorEditorProps,
  DimensionsTriplet,
  getInternationalStringText,
  InputContainer,
  useInStack,
} from "@manifest-editor/editors";
import {
  type EditorDefinition,
  useApp,
  useEditor,
  useLocalStorage,
  usePresetTemplateSelection,
} from "@manifest-editor/shell";
import { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { useCanvas, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { AspectRatioWarning } from "../components/AspectRatioWarning";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import {
  getPaintingAnnotations,
  getResolvedAnnotationBody,
  getTourStepAnnotations,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";
import { ExhibitionThumbnailEditor } from "./ExhibitionThumbnailEditor";

type EditingMode = "simple" | "advanced";
type LayoutEditingContext = "default" | "slideshow";
export type ExhibitionTemplateType = "fullpage" | "slideshow" | "scroll";
export type LayoutPreset = "image" | "right" | "left" | "bottom";
export type DisplayWidth = 12 | 8 | 6 | 4;
export type BackdropBehavior = "" | "backdrop-light" | "backdrop-dark";
export type FloatingBehavior =
  | "float-top-left"
  | "float-top"
  | "float-top-right"
  | "float-left"
  | "float-right"
  | "float-bottom-left"
  | "float-bottom"
  | "float-bottom-right";

const layoutBehaviors = new Set(["left", "right", "bottom", "top", "image"]);
const scrollBehaviors = new Set(["scroll", "page-scroll"]);
const coverBehaviors = new Set(["cover", "image-cover"]);
const scrollDisplayBehaviors = new Set([
  "splash",
  "fixed",
  "invert",
  "backdrop-light",
  "backdrop-dark",
  "compact-deck",
]);
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
export const floatingBehaviorOptions: Array<{ value: FloatingBehavior; label: string }> = [
  { value: "float-top-left", label: "Top left" },
  { value: "float-top", label: "Top" },
  { value: "float-top-right", label: "Top right" },
  { value: "float-left", label: "Left" },
  { value: "float-right", label: "Right" },
  { value: "float-bottom-left", label: "Bottom left" },
  { value: "float-bottom", label: "Bottom" },
  { value: "float-bottom-right", label: "Bottom right" },
];
const floatingBehaviors = new Set<FloatingBehavior>(floatingBehaviorOptions.map((option) => option.value));

// Position of the small "floating" square inside the FloatingPositionIcon, keyed by behavior.
const floatingIconRects: Record<FloatingBehavior, { x: number; y: number }> = {
  "float-top-left": { x: 2, y: 2 },
  "float-top": { x: 8.5, y: 2 },
  "float-top-right": { x: 15, y: 2 },
  "float-left": { x: 2, y: 8.5 },
  "float-right": { x: 15, y: 8.5 },
  "float-bottom-left": { x: 2, y: 15 },
  "float-bottom": { x: 8.5, y: 15 },
  "float-bottom-right": { x: 15, y: 15 },
};

/**
 * A little design-tool style diagram: an outer frame (the slide) with a filled square showing where the
 * floating panel will sit. Pass an empty position to render the "clear" (no floating) glyph instead.
 */
export function FloatingPositionIcon({ position }: { position: "" | FloatingBehavior }) {
  return (
    <svg width="1.6em" height="1.6em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {position ? (
        <rect {...floatingIconRects[position]} width="7" height="7" rx="1.5" fill="currentColor" />
      ) : (
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      )}
    </svg>
  );
}

/** The 8 floating positions plus a "clear" option in the middle, in 3x3 reading order. */
export function floatingGridWithCenter(clearLabel = "Off"): Array<{ value: "" | FloatingBehavior; label: string }> {
  return [
    ...floatingBehaviorOptions.slice(0, 4),
    { value: "" as const, label: clearLabel },
    ...floatingBehaviorOptions.slice(4),
  ];
}

/** Shared 3x3 icon grid for picking (or clearing) a floating position. */
export function FloatingPositionPicker({
  value,
  onChange,
  clearLabel = "Off",
}: {
  value: "" | FloatingBehavior;
  onChange: (value: "" | FloatingBehavior) => void;
  clearLabel?: string;
}) {
  return (
    <div className="grid w-fit grid-cols-3 gap-2">
      {floatingGridWithCenter(clearLabel).map((option) => (
        <SimpleOptionButton
          key={option.value || "off"}
          title={option.label}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <FloatingPositionIcon position={option.value} />
          <span className="sr-only">{option.label}</span>
        </SimpleOptionButton>
      ))}
    </div>
  );
}
const layoutPanelModeStorageKey = "exhibition-layout-panel-mode";

export function hasScrollBehavior(behavior: string[]) {
  return behavior.some((item) => scrollBehaviors.has(item));
}

export function hasCoverBehavior(behavior: string[]) {
  return behavior.some((item) => coverBehaviors.has(item));
}

export function resolveExhibitionTemplateType(templateType?: string, appId?: string): ExhibitionTemplateType {
  if (templateType === "slideshow" || templateType === "scroll" || templateType === "fullpage") {
    return templateType;
  }
  if (appId === "exhibition-slideshow-editor") return "slideshow";
  if (appId === "exhibition-scrolling-editor") return "scroll";
  return "fullpage";
}

export function getExhibitionTemplateControls(
  templateType: ExhibitionTemplateType,
  scrollEnabled = false,
  hasTourSteps = true,
) {
  const scrollContext = templateType === "scroll" || scrollEnabled;
  const showGridSizing = templateType === "fullpage" && !scrollEnabled;
  const showFloating = templateType === "slideshow" || templateType === "scroll";

  return {
    showGridSizing,
    isSlideshow: templateType === "slideshow",
    showFloating: showFloating || scrollEnabled,
    showImageCover: templateType === "fullpage" || scrollContext,
    showScrollToggle: templateType === "fullpage",
    showScrollDisplay: scrollContext,
    showFixedCover: templateType === "scroll",
    showCoverBackdrop: templateType === "scroll",
    scrollContext,
    layoutOptions: scrollContext
      ? hasTourSteps
        ? [
            { value: "right" as const, label: "Align annotations right" },
            { value: "left" as const, label: "Align annotations left" },
          ]
        : []
      : layoutPresetOptions,
  };
}

export function useExhibitionTemplateControls(behavior: string[] = [], hasTourSteps = true) {
  const app = useApp();
  const { selectedTemplate } = usePresetTemplateSelection();
  return getExhibitionTemplateControls(
    resolveExhibitionTemplateType(selectedTemplate?.type, app.metadata.id),
    hasScrollBehavior(behavior),
    hasTourSteps,
  );
}

export const customBehaviourEditor: EditorDefinition = {
  component: () => <SlideBehavioursPanel />,
  supports: {
    edit: true,
    resourceTypes: ["Canvas"],
    properties: ["behavior"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource as any, vault)) return false;
      // The standalone layout panel is not shown for textual-content (info box) canvases;
      // they get their own layout section inside the workbench editor.
      return !isInfoBoxCanvas(resource as any, vault);
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
    items: floatingBehaviorOptions.map((option) => ({
      label: { en: [`Float ${option.label.toLowerCase()}`] },
      value: option.value,
    })),
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

function BehaviorFlagCheckboxes({
  behaviors,
  setBehaviors,
  flags,
}: {
  behaviors: string[];
  setBehaviors: (behaviors: string[]) => void;
  flags: Array<{
    value: string;
    label: string;
    aliases?: string[];
    group?: string[];
    clean?: (behaviors: string[], checked: boolean) => string[];
  }>;
}) {
  const setFlag = (flag: (typeof flags)[number], checked: boolean) => {
    const blocked = new Set([flag.value, ...(flag.aliases || []), ...(flag.group || [])]);
    const next = behaviors.filter((item) => !blocked.has(item));
    if (checked) next.push(flag.value);
    setBehaviors(flag.clean ? flag.clean(next, checked) : next);
  };

  return (
    <div className="flex flex-col gap-2">
      {flags.map((flag) => (
        <SimpleCheckbox
          key={flag.value}
          checked={behaviors.includes(flag.value) || Boolean(flag.aliases?.some((alias) => behaviors.includes(alias)))}
          label={flag.label}
          onChange={(checked) => setFlag(flag, checked)}
        />
      ))}
    </div>
  );
}

export function getAdvancedExhibitionConfigs(
  templateType: ExhibitionTemplateType,
  behavior: string[] = [],
  isCoverCanvas = true,
  hasTourSteps = true,
): BehaviorEditorProps["configs"] {
  const controls = getExhibitionTemplateControls(templateType, hasScrollBehavior(behavior), hasTourSteps);
  const showCoverDisplay = controls.showScrollDisplay && isCoverCanvas;
  const configs: BehaviorEditorProps["configs"] = [];

  if (controls.layoutOptions.length && !(controls.isSlideshow && hasFloatingBehavior(behavior))) {
    configs.push({
      ...exhibitionConfigs[0]!,
      items: controls.layoutOptions.map((option) => ({
        label: { en: [option.label] },
        value: option.value,
      })),
    });
  }

  if (controls.showScrollToggle) {
    configs.push({
      id: "scroll",
      type: "custom",
      label: { en: ["Scroll"] },
      initialOpen: false,
      supports: (b) => scrollBehaviors.has(b),
      component: (existing, setBehaviors) => (
        <BehaviorFlagCheckboxes
          behaviors={existing}
          setBehaviors={setBehaviors}
          flags={[
            {
              value: "scroll",
              label: "Scroll",
              aliases: ["page-scroll"],
              clean: (next, checked) => (checked ? next.filter((item) => !isGridBehavior(item)) : next),
            },
          ]}
        />
      ),
    });
  }

  if (controls.showImageCover) {
    configs.push({
      id: "display",
      type: "custom",
      label: { en: ["Display"] },
      initialOpen: false,
      supports: (b) => coverBehaviors.has(b),
      component: (existing, setBehaviors) => (
        <BehaviorFlagCheckboxes
          behaviors={existing}
          setBehaviors={setBehaviors}
          flags={[{ value: "cover", label: "Fill image area", aliases: ["image-cover"] }]}
        />
      ),
    });
  }

  if (showCoverDisplay) {
    configs.push({
      id: "cover",
      type: "custom",
      label: { en: ["Cover"] },
      initialOpen: false,
      supports: (b) => scrollDisplayBehaviors.has(b),
      component: (existing, setBehaviors) => (
        <BehaviorFlagCheckboxes
          behaviors={existing}
          setBehaviors={setBehaviors}
          flags={[
            { value: "splash", label: "Cover screen" },
            ...(controls.showFixedCover ? [{ value: "fixed", label: "Fixed" }] : []),
            { value: "invert", label: "Invert" },
            ...(controls.showCoverBackdrop
              ? [
                  {
                    value: "backdrop-light",
                    label: "Light backdrop",
                    group: ["backdrop-dark"],
                  },
                  {
                    value: "backdrop-dark",
                    label: "Dark backdrop",
                    group: ["backdrop-light"],
                  },
                ]
              : []),
            { value: "compact-deck", label: "Compact deck" },
          ]}
        />
      ),
    });
  }

  if (controls.showFloating) {
    configs.push(exhibitionConfigs[1]!);
  }
  if (controls.showGridSizing) {
    configs.push(exhibitionConfigs[2]!);
  }

  return configs;
}

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
  const setCenterPanelMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);

  useEffect(() => {
    setCenterPanelMode("preview");
  }, [setCenterPanelMode]);

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
  const currentCanvas = useCanvas();
  const editor = useEditor();
  const app = useApp();
  const vault = useVault();
  const manifest = useManifest();
  const { selectedTemplate } = usePresetTemplateSelection();
  const templateType = resolveExhibitionTemplateType(
    selectedTemplate?.type,
    layoutContext === "slideshow" ? "exhibition-slideshow-editor" : app.metadata.id,
  );
  const { width, height } = editor.technical;
  const behavior = editor.technical.behavior.get() || [];
  const hasTourSteps = useVaultSelector(
    (_, vaultInstance) => (currentCanvas ? getTourStepAnnotations(vaultInstance, currentCanvas).length > 0 : false),
    [currentCanvas?.id, currentCanvas?.annotations?.[0]?.id],
  );
  const controls = getExhibitionTemplateControls(templateType, hasScrollBehavior(behavior), hasTourSteps);
  const isCoverCanvas = Boolean(
    currentCanvas && manifestFirstCanvasId(manifest) === currentCanvas.id && isImageCanvas(vault, currentCanvas),
  );

  if (!canvas || editor.technical.type !== "Canvas") {
    return <div className="p-4">Please select canvas</div>;
  }

  if (mode === "simple") {
    return (
      <SimpleSlideLayoutEditor
        behavior={editor.technical.behavior.get() || []}
        controls={controls}
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
        configs={getAdvancedExhibitionConfigs(templateType, behavior, isCoverCanvas, hasTourSteps)}
      />

      <ExhibitionThumbnailEditor />
    </>
  );
}

function SimpleSlideLayoutEditor({
  behavior,
  controls,
  canvasWidth,
  canvasHeight,
  onChange,
}: {
  behavior: string[];
  controls: ReturnType<typeof getExhibitionTemplateControls>;
  canvasWidth: number;
  canvasHeight: number;
  onChange: (newValue: string[]) => void;
}) {
  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>(getLayoutPreset(behavior));
  const [displayWidth, setDisplayWidth] = useState<DisplayWidth>(
    controls.showGridSizing ? getDisplayWidth(behavior) : 12,
  );
  const [floating, setFloating] = useState(hasFloatingBehavior(behavior));
  const [floatingBehavior, setFloatingBehavior] = useState<FloatingBehavior>(getFloatingBehavior(behavior));
  const [cover, setCover] = useState(hasCoverBehavior(behavior));
  const [scrollEnabled, setScrollEnabled] = useState(hasScrollBehavior(behavior));
  const [splash, setSplash] = useState(behavior.includes("splash"));
  const [fixed, setFixed] = useState(behavior.includes("fixed"));
  const [invert, setInvert] = useState(behavior.includes("invert"));
  const [backdrop, setBackdrop] = useState<BackdropBehavior>(
    behavior.includes("backdrop-dark") ? "backdrop-dark" : behavior.includes("backdrop-light") ? "backdrop-light" : "",
  );
  const requestWorkbenchTab = useSlideshowWorkbenchState((state) => state.requestTab);
  const canvas = useCanvas();
  const vault = useVault();
  const manifest = useManifest();
  const selectedWidth = controls.showGridSizing ? displayWidth : 12;
  const previewHeight = getDerivedHeight({
    canvasWidth,
    canvasHeight,
    layoutPreset,
    displayWidth: selectedWidth,
  });

  const fitSuggestion =
    controls.showGridSizing && manifest?.items && canvas
      ? computeFitWidth(canvas.id, manifest.items as Array<{ id: string }>, vault)
      : null;
  const isCoverCanvas = Boolean(
    canvas && manifestFirstCanvasId(manifest) === canvas.id && isImageCanvas(vault, canvas),
  );

  const applySettings = (next: {
    layoutPreset?: LayoutPreset;
    displayWidth?: DisplayWidth;
    floating?: boolean;
    floatingBehavior?: FloatingBehavior;
    cover?: boolean;
    scrollEnabled?: boolean;
    splash?: boolean;
    fixed?: boolean;
    invert?: boolean;
    backdrop?: BackdropBehavior;
  }) => {
    const nextLayoutPreset = controls.layoutOptions.length ? (next.layoutPreset ?? layoutPreset) : "image";
    const nextDisplayWidth = controls.showGridSizing ? (next.displayWidth ?? displayWidth) : 12;
    const nextFloating = next.floating ?? floating;
    const nextFloatingBehavior = next.floatingBehavior ?? floatingBehavior;
    const nextCover = next.cover ?? cover;
    const nextScrollEnabled = next.scrollEnabled ?? scrollEnabled;
    const nextSplash = next.splash ?? splash;
    const nextFixed = next.fixed ?? fixed;
    const nextInvert = next.invert ?? invert;
    const nextBackdrop = next.backdrop ?? backdrop;
    const nextScrollContext = controls.scrollContext || nextScrollEnabled;

    onChange(
      buildSimpleLayoutBehaviors({
        behavior,
        layoutPreset: nextLayoutPreset,
        displayWidth: nextDisplayWidth,
        canvasWidth,
        canvasHeight,
        floating: nextFloating,
        floatingBehavior: nextFloatingBehavior,
        cover: nextCover,
        scrollEnabled: nextScrollEnabled,
        splash: nextSplash,
        fixed: controls.showFixedCover && nextFixed,
        invert: nextInvert,
        backdrop: controls.showCoverBackdrop ? nextBackdrop : "",
        showGridSizing: controls.showGridSizing && !nextScrollEnabled,
        showFloating: controls.showFloating,
        showImageCover: controls.showImageCover,
        showScrollToggle: controls.showScrollToggle,
        showScrollDisplay: nextScrollContext && isCoverCanvas,
        scrollContext: nextScrollContext,
      }),
    );

    if (canvas) {
      injectTextPlaceholders(vault, canvas, nextLayoutPreset);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <SimpleLayoutPreview
        layoutPreset={layoutPreset}
        cover={cover}
        floating={floating}
        width={selectedWidth}
        height={previewHeight}
        showGridSizing={controls.showGridSizing}
        onTextClick={() => requestWorkbenchTab("summary")}
      />

      {controls.layoutOptions.length && !(controls.isSlideshow && floating) ? (
        <SimpleField>
          <SimpleFieldLabel>Layout preset</SimpleFieldLabel>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {controls.layoutOptions.map((option) => (
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
      ) : null}

      {controls.showGridSizing ? (
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
        {controls.showScrollToggle ? (
          <SimpleCheckbox
            checked={scrollEnabled}
            label="Scroll"
            onChange={(checked) => {
              setScrollEnabled(checked);
              applySettings({ scrollEnabled: checked });
            }}
          />
        ) : null}
        {controls.showFloating ? (
          <SimpleCheckbox
            checked={floating}
            label="Floating"
            onChange={(checked) => {
              setFloating(checked);
              applySettings({ floating: checked });
            }}
          />
        ) : null}
        {controls.isSlideshow && floating ? (
          <SimpleField>
            <SimpleFieldLabel>Floating position</SimpleFieldLabel>
            <div className="mt-3">
              <FloatingPositionPicker
                value={floatingBehavior}
                clearLabel="Off"
                onChange={(next) => {
                  if (next) {
                    setFloatingBehavior(next);
                    applySettings({ floatingBehavior: next });
                  } else {
                    setFloating(false);
                    applySettings({ floating: false });
                  }
                }}
              />
            </div>
          </SimpleField>
        ) : null}
        {controls.showImageCover ? (
          <SimpleCheckbox
            checked={cover}
            label="Fill image area"
            onChange={(checked) => {
              setCover(checked);
              applySettings({ cover: checked });
            }}
          />
        ) : null}
        {controls.showScrollDisplay && isCoverCanvas ? (
          <SimpleField>
            <SimpleFieldLabel>Cover</SimpleFieldLabel>
            <div className="mt-3 flex flex-col gap-3">
              <SimpleCheckbox
                checked={splash}
                label="Cover screen"
                onChange={(checked) => {
                  setSplash(checked);
                  applySettings({ splash: checked });
                }}
              />
              {controls.showFixedCover ? (
                <SimpleCheckbox
                  checked={fixed}
                  label="Fixed"
                  onChange={(checked) => {
                    setFixed(checked);
                    applySettings({ fixed: checked });
                  }}
                />
              ) : null}
              <SimpleCheckbox
                checked={invert}
                label="Invert"
                onChange={(checked) => {
                  setInvert(checked);
                  applySettings({ invert: checked });
                }}
              />
              {controls.showCoverBackdrop ? (
                <SimpleField>
                  <SimpleFieldLabel>Backdrop</SimpleFieldLabel>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { value: "" as const, label: "Default" },
                      { value: "backdrop-light" as const, label: "Light" },
                      { value: "backdrop-dark" as const, label: "Dark" },
                    ].map((option) => (
                      <SimpleOptionButton
                        key={option.value || "default"}
                        selected={backdrop === option.value}
                        onClick={() => {
                          setBackdrop(option.value);
                          applySettings({ backdrop: option.value });
                        }}
                      >
                        {option.label}
                      </SimpleOptionButton>
                    ))}
                  </div>
                </SimpleField>
              ) : null}
            </div>
          </SimpleField>
        ) : null}
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
  showGridSizing,
  onTextClick,
}: {
  layoutPreset: LayoutPreset;
  cover: boolean;
  floating: boolean;
  width: DisplayWidth;
  height: number;
  showGridSizing: boolean;
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
      {showGridSizing ? (
        <div className="mt-2 text-center text-xs" style={{ color: simpleLayoutColours.muted }}>
          w-{width} h-{height}
        </div>
      ) : null}
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
  title,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={selected}
      className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
      style={{
        backgroundColor: selected ? simpleLayoutColours.primary : simpleLayoutColours.buttonText,
        borderColor: selected ? simpleLayoutColours.primary : simpleLayoutColours.fieldBorder,
        color: selected ? simpleLayoutColours.buttonText : simpleLayoutColours.inactiveButtonText,
        boxShadow: selected ? `0 0 0 2px ${simpleLayoutColours.primary}33` : undefined,
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

export function buildLayoutPresetBehaviors(
  behavior: string[],
  layoutPreset: LayoutPreset,
  canvasDimensions?: { width: number; height: number },
) {
  const next = behavior.filter((item) => !layoutBehaviors.has(item));
  if (canvasDimensions?.width && canvasDimensions?.height) {
    const { width: parsedWidth } = parseBehaviors(behavior);
    const displayWidth: DisplayWidth = parsedWidth
      ? parsedWidth <= 4
        ? 4
        : parsedWidth <= 6
          ? 6
          : parsedWidth <= 8
            ? 8
            : 12
      : 12;
    const newHeight = getDerivedHeight({
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      layoutPreset,
      displayWidth,
    });
    // Replace existing h- behavior with recalculated one
    const withoutH = next.filter((item) => !item.startsWith("h-"));
    withoutH.push(`h-${newHeight}`);
    withoutH.push(layoutPreset);
    return withoutH;
  }
  return [...next, layoutPreset];
}

function getDisplayWidth(behavior: string[]): DisplayWidth {
  const { width } = parseBehaviors(behavior);

  if (!width) return 12;
  if (width <= 4) return 4;
  if (width <= 6) return 6;
  if (width <= 8) return 8;
  return 12;
}

export function hasFloatingBehavior(behavior: string[]) {
  return behavior.includes("floating") || behavior.some((item) => floatingBehaviors.has(item as FloatingBehavior));
}

export function getFloatingBehavior(behavior: string[]): FloatingBehavior {
  return (
    behavior.find((item): item is FloatingBehavior => floatingBehaviors.has(item as FloatingBehavior)) ||
    "float-top-right"
  );
}

export function buildSimpleLayoutBehaviors({
  behavior,
  layoutPreset,
  displayWidth,
  canvasWidth,
  canvasHeight,
  floating,
  floatingBehavior,
  cover,
  scrollEnabled,
  splash,
  fixed,
  invert,
  backdrop,
  showGridSizing,
  showFloating,
  showImageCover,
  showScrollToggle,
  showScrollDisplay,
  scrollContext,
}: {
  behavior: string[];
  layoutPreset: LayoutPreset;
  displayWidth: DisplayWidth;
  canvasWidth: number;
  canvasHeight: number;
  floating: boolean;
  floatingBehavior?: FloatingBehavior;
  cover: boolean;
  scrollEnabled: boolean;
  splash: boolean;
  fixed: boolean;
  invert: boolean;
  backdrop: BackdropBehavior;
  showGridSizing: boolean;
  showFloating: boolean;
  showImageCover: boolean;
  showScrollToggle: boolean;
  showScrollDisplay: boolean;
  scrollContext: boolean;
}) {
  const next = behavior.filter((item) => {
    if (layoutBehaviors.has(item)) return false;
    if ((showGridSizing || scrollEnabled) && isGridBehavior(item)) return false;
    if (showFloating && (item === "floating" || floatingBehaviors.has(item as FloatingBehavior))) return false;
    if (showImageCover && coverBehaviors.has(item)) return false;
    if (showScrollToggle && scrollBehaviors.has(item)) return false;
    if (showScrollDisplay && scrollDisplayBehaviors.has(item)) return false;
    return true;
  });

  if (showScrollToggle && scrollEnabled) {
    next.push("scroll");
  }

  if (!scrollContext || layoutPreset !== "image") {
    next.push(layoutPreset);
  }

  if (showGridSizing) {
    const height = getDerivedHeight({
      canvasWidth,
      canvasHeight,
      layoutPreset,
      displayWidth,
    });
    next.push(`w-${displayWidth}`, `h-${height}`);
  }

  if (showFloating && floating) {
    next.push(floatingBehavior || "float-top-right");
  }

  if (showImageCover && cover) {
    next.push("cover");
  }

  if (showScrollDisplay) {
    if (splash) next.push("splash");
    if (fixed) next.push("fixed");
    if (invert) next.push("invert");
    if (backdrop) next.push(backdrop);
  }

  return next;
}

function isGridBehavior(item: string) {
  return item.startsWith("w-") || item.startsWith("h-") || item.startsWith("start-");
}

function manifestFirstCanvasId(manifest: any) {
  return manifest?.items?.[0]?.id;
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

export function getDerivedHeight({
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
  const controls = useExhibitionTemplateControls();

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
    controls.showGridSizing && manifest?.items && canvas
      ? computeFitWidth(canvas.id, manifest.items as Array<{ id: string }>, vault)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <SimpleAdvancedToggle value={mode} onChange={setMode} />
      </div>

      {mode === "simple" && controls.showGridSizing ? (
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
      ) : mode === "advanced" ? (
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

          {controls.showGridSizing ? (
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
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const TEXT_LAYOUTS = new Set<LayoutPreset>(["left", "right", "bottom"]);

/**
 * When switching to a layout that shows an editorial text panel, ensure the
 * canvas has at least a placeholder label and summary so the panel is visible
 * and editable rather than an invisible black rectangle.
 */
export function injectTextPlaceholders(vault: ReturnType<typeof useVault>, canvas: any, preset: LayoutPreset) {
  if (!TEXT_LAYOUTS.has(preset)) return;

  const existingLabel = getInternationalStringText(canvas.label);
  if (!existingLabel) {
    vault.modifyEntityField(canvas, "label", { en: ["Untitled"] });
  }

  const existingSummary = getInternationalStringText(canvas.summary);
  if (!existingSummary) {
    vault.modifyEntityField(canvas, "summary", { en: ["Add a description for this slide."] });
  }
}
